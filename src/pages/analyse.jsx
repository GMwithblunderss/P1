import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Sidebars from "../components/sidebar";
import { useLocation } from "react-router-dom";
import Ansidebar from "../components/ansidebar";
import iconMap from "../components/icons";
import Evalbar from "../components/evalbar";
import GameSummaryBox from "../components/startingevals.jsx";
import "./pages-css/analyse.css"; 
import AnsidebarHorizontal from "../components/horizontalansidebar.jsx";
import UniqueSidebars from "../components/verticalsidebar.jsx";
import { prewarmStockfish } from '../wasmanalysis.js';
import { API_URL } from '../pathconfig.js';


const Analytics = () => {
    const location = useLocation();
    const gameDataRef = useRef(null);
    
    const gameData = useMemo(() => {
        const state = location.state;
        if (!state?.key || !state?.moves?.length || !state?.pgn) {
            return null;
        }
        return state;
    }, [location.state]);


    if (!gameData) {
        return (
            <div className="analytics-loading-container">
                <div className="analytics-loading-text">Loading analysis...</div>
            </div>
        );
    }


    if (gameDataRef.current?.key !== gameData.key) {
        gameDataRef.current = gameData;
        return <AnalyticsCore key={gameData.key} gameData={gameData} />;
    }


    return <AnalyticsCore key={gameData.key} gameData={gameData} />;
};


const AnalyticsCore = ({ gameData }) => {
    const {
        pgn, moves, bestmoves, grading, userwinpercents, grademovenumber,
        blackgradeno, pvfen, booknames, userevalrating, oppevalrating,
        userrating, opprating, userusername, oppusername, whiteacpl,
        blackacpl, isWhite,whiteTimeStrings,blackTimeStrings
    } = gameData;


    const [Count, setCount] = useState(0);
    const [arrows, setarrows] = useState([]);
    const [showIcon, setShowIcon] = useState(false);
    const [displyansidebar, setdisplayansidebar] = useState("none");
    const [boardOrientation, setboardOrientation] = useState("white");
    const [mainboard, setmainboard] = useState("");
    const [pvtrying, setpvtrying] = useState(false);
    const [pvindex, setpvindex] = useState(0);
    const [pvframe, setpvframe] = useState(0);
    const [savedCount, setSavedCount] = useState(0); 
    const [boardSize, setBoardSize] = useState(640);
    const [pvBoardSize, setPvBoardSize] = useState(640);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [reviewStarted, setReviewStarted] = useState(false);
    const [whiteuname, setwhiteuname] = useState("White Player");
    const [blackuname, setblackuname] = useState("Black Player");
    const [pvChess, setPvChess] = useState(null);
    const [customPvFen, setCustomPvFen] = useState(null);
    const [isCustomPv, setIsCustomPv] = useState(false);
    const [pvGrade, setPvGrade] = useState(null);
    const [pvEvaluation, setPvEvaluation] = useState(null);
    const [isPvAnalyzing, setIsPvAnalyzing] = useState(false);
    const stockfishServiceRef = useRef(null);
    const [lastPvMove, setLastPvMove] = useState(null);
    const [pvArrows, setPvArrows] = useState([]);
    
    const [mainChess, setMainChess] = useState(null);
    const [customMainFen, setCustomMainFen] = useState(null);
    const [isCustomMain, setIsCustomMain] = useState(false);
    const [mainGrade, setMainGrade] = useState(null);
    const [mainEvaluation, setMainEvaluation] = useState(null);
    const [isMainAnalyzing, setIsMainAnalyzing] = useState(false);
    const [mainArrows, setMainArrows] = useState([]);


    const pvBoardRef = useRef(null);
    const boardRef = useRef(null);


    const derivedData = useMemo(() => {
        const chess = new Chess();
        const fens = [chess.fen()];
        moves.forEach(move => {
            try {
                chess.move(move);
                fens.push(chess.fen());
            } catch (err) {
                console.error("Error with position:", err);
            }
        });


        const fromSquares = [];
        const toSquares = [];
        for (const move of bestmoves) {
            if (typeof move === "string" && move.length >= 4) {
                fromSquares.push(move.substring(0, 2));
                toSquares.push(move.substring(2, 4));
            } else {
                fromSquares.push(null);
                toSquares.push(null);
            }
        }


        const tochess = new Chess();
        const toSquare = [];
        for (const moved of moves) {
            if (typeof moved === "string" && moved.length >= 2) {
                const result = tochess.move(moved);
                if (result && result.to) {
                    toSquare.push(result.to);
                }
            }
        }


        return { fens, fromSquares, toSquares, toSquare };
    }, [moves, bestmoves]);


    useEffect(() => {
        const timer = setTimeout(() => setShowIcon(true), 3000);
        return () => clearTimeout(timer);
    }, []);


useEffect(() => {
    const initStockfish = async () => {
        stockfishServiceRef.current = await prewarmStockfish();
    };
    initStockfish();
}, []);


useEffect(() => {
    if (!isCustomMain) {
        const safeCount = Math.min(Math.max(Count, 0), derivedData.fens.length - 1);
        const fen = derivedData.fens[safeCount];
        setCustomMainFen(fen);
        setMainChess(new Chess(fen));
        setMainGrade(null);
        setMainEvaluation(null);
        setMainArrows([]);
    }
}, [Count, derivedData.fens, isCustomMain]);


useEffect(() => {
    if (pvtrying) {
        const currentpv = pvfen[pvindex - 1] || [];
        const fen = currentpv[pvframe] || new Chess().fen();
        const chess = new Chess(fen);
        setPvChess(chess);
        
        setCustomPvFen(fen);
        setIsCustomPv(false);
    }
}, [pvtrying, pvindex, pvframe, pvfen]);


useEffect(() => {
    if (!pvBoardRef.current || !pvtrying) return;
    const observer = new ResizeObserver(entries => {
        setPvBoardSize(entries[0].contentRect.width);
    });
    observer.observe(pvBoardRef.current);
    return () => observer.disconnect();
}, [pvtrying]);


    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    useEffect(() => {
        if (!boardRef.current) return;
        const observer = new ResizeObserver(entries => {
            setBoardSize(entries[0].contentRect.width);
        });
        observer.observe(boardRef.current);
        return () => observer.disconnect();
    }, []);


    useEffect(() => {
        try {
            const whiteMatch = pgn.match(/\[White\s+"(.+?)"\]/);
            const blackMatch = pgn.match(/\[Black\s+"(.+?)"\]/);
            if (whiteMatch?.[1]) setwhiteuname(whiteMatch[1]);
            if (blackMatch?.[1]) setblackuname(blackMatch[1]);
        } catch (error) {
            console.error("Error parsing PGN:", error);
        }
    }, [pgn]);


    useEffect(() => {
        const arrowcount = Count - 1;
        if (arrowcount >= 5 &&
            arrowcount < derivedData.fromSquares.length &&
            derivedData.fromSquares[arrowcount] &&
            derivedData.toSquares[arrowcount] && 
            !pvtrying &&
            !isCustomMain) {
            setarrows([{
                startSquare: derivedData.fromSquares[arrowcount],
                endSquare: derivedData.toSquares[arrowcount],
                color: "blue"
            }]);
        } else {
            setarrows([]);
        }
    }, [Count, derivedData.fromSquares, derivedData.toSquares, pvtrying, isCustomMain]);


useEffect(() => {
    if (!pvtrying || !pvfen.length || isCustomPv) return;


    const interval = setInterval(() => {
        setpvframe(prev => {
            const currentpv = pvfen[pvindex - 1] || [];
            const maxFrame = Math.min(5, Math.min(13, currentpv.length)) - 1;
            const newFrame = prev < maxFrame ? prev + 1 : prev;
            if (newFrame === prev) {
                clearInterval(interval);
            }
            return newFrame;
        });
    }, 800);
    
    return () => clearInterval(interval);
}, [pvtrying, pvfen, pvindex, isCustomPv]);


useEffect(() => {
    if (!pvtrying) {
        setPvArrows([]);
    }
}, [pvtrying]);


useEffect(() => {
    if (!isCustomPv) {
        setPvArrows([]);
    }
}, [isCustomPv]);


useEffect(() => {
    if (!isCustomMain) {
        setMainArrows([]);
    }
}, [isCustomMain]);


    function acplToAccuracy(acpl) {
        const k = 0.005;
        let acc = 100 * Math.exp(-k * acpl);
        return parseFloat(acc.toFixed(2));
    }


    const whiteaccuracy = acplToAccuracy(whiteacpl);
    const blackaccuracy = acplToAccuracy(blackacpl);


    const handlecount = (value) => {
        setCount(value);
        setIsCustomMain(false);
        setMainGrade(null);
        setMainEvaluation(null);
        setMainArrows([]);
        setTimeout(() => setCount(prev => prev + 1), 10);
    };


const handleMainPieceDrop = async ({ sourceSquare, targetSquare, piece }) => {
    if (!mainChess || pvtrying) {
        return false;
    }


    try {
        const fenBefore = mainChess.fen();
        const testChess = new Chess(fenBefore);
        
        const move = testChess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        });


        if (move === null) {
            return false;
        }
        
        const newFen = testChess.fen();
        const uciMove = move.from + move.to + (move.promotion || '');
        
        setCustomMainFen(newFen);
        setIsCustomMain(true);
        setMainChess(testChess);
        setIsMainAnalyzing(true);
        setMainGrade(null);
        setMainEvaluation(null);
        
        await analyzeMainMove(fenBefore, newFen, uciMove);


        return true;
    } catch (error) {
        console.error("Error in handleMainPieceDrop:", error);
        setIsMainAnalyzing(false);
        return false;
    }
};


const formatTime = (timeString) => {
    if (!timeString) return "0:00";
    
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        
        const secondsPart = parts[2] || '0';
        const [secondsStr, millisecondsStr] = secondsPart.split('.');
        const seconds = parseInt(secondsStr, 10);
        const milliseconds = millisecondsStr ? millisecondsStr.substring(0, 3) : null;
        
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        
        const displayMinutes = minutes.toString().padStart(2, '0');
        const displaySeconds = seconds.toString().padStart(2, '0');
        
        let timeDisplay = '';
        
        if (hours > 0) {
            timeDisplay = `${hours}:${displayMinutes}:${displaySeconds}`;
        } else {
            timeDisplay = `${minutes}:${displaySeconds}`;
        }
        
        if (totalSeconds < 20 && milliseconds) {
            timeDisplay += `.${milliseconds}`;
        }
        
        return timeDisplay;
    }
    return "0:00";
};


const getCurrentTimes = () => {
    const whiteIndex = Count >= 1 ? Math.floor((Count - 1) / 2) : -1;
    const blackIndex = Count >= 2 ? Math.floor(Count / 2) - 1 : -1;
    
    return {
        whiteTime: whiteIndex >= 0 ? formatTime(whiteTimeStrings?.[whiteIndex]) : formatTime(whiteTimeStrings?.[0]),
        blackTime: blackIndex >= 0 ? formatTime(blackTimeStrings?.[blackIndex]) : formatTime(blackTimeStrings?.[0])
    };
};


const { whiteTime, blackTime } = getCurrentTimes();
//console.log("white times",whiteTime);
//console.log("white times",blackTime);


const analyzeMainMove = async (fenBefore, fenAfter, uciMove) => {
    const username = localStorage.getItem("currentUser");
    
    try {
        const stockfishService = stockfishServiceRef.current;
        if (!stockfishService) {
            console.warn("Stockfish not ready");
            setIsMainAnalyzing(false);
            return;
        }


        const analysisBefore = await stockfishService.analyzeFen(fenBefore, { depth: 15 });
        const analysisAfter = await stockfishService.analyzeFen(fenAfter, { depth: 15 });
        
        if (analysisAfter?.bestmove && analysisAfter.bestmove.length >= 4) {
            setMainArrows([{
                startSquare: analysisAfter.bestmove.substring(0, 2),
                endSquare: analysisAfter.bestmove.substring(2, 4),
                color: "green"
            }]);
        } else {
            setMainArrows([]);
        }
        
        const bestmove = analysisBefore?.bestmove;
        let bestFen = null;
        let bestAnalysis = null;
        
        if (bestmove) {
            const chessForBest = new Chess(fenBefore);
            const bestMoveResult = chessForBest.move({
                from: bestmove.slice(0, 2),
                to: bestmove.slice(2, 4),
                promotion: bestmove[4] || 'q'
            });
            
            if (bestMoveResult) {
                bestFen = chessForBest.fen();
                bestAnalysis = await stockfishService.analyzeFen(bestFen, { depth: 14 });
            }
        }


        const fens = [fenBefore, fenAfter];
        const results = [
            { fen: fenBefore, analysis: analysisBefore },
            { fen: fenAfter, analysis: analysisAfter }
        ];
        const bestfens = [bestFen];
        const bestresults = [
            bestFen ? { fen: bestFen, analysis: bestAnalysis } : null
        ];


        const storeResponse = await fetch(`${API_URL}/wasmResultsPv`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fens,
                results,
                bestfens,
                bestresults,
                username
            }),
        });


        if (!storeResponse.ok) {
            throw new Error("Failed to store WASM results");
        }


        await new Promise(resolve => setTimeout(resolve, 200));


        const gradeResponse = await fetch(`${API_URL}/gradePvMove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                playedMove: uciMove,
                fenBefore
            }),
        });


        if (gradeResponse.ok) {
            const gradeData = await gradeResponse.json();
            setMainGrade(gradeData.grade);
            setMainEvaluation(gradeData.evaluation);
        } else {
            console.error("Grading failed:", await gradeResponse.text());
        }


    } catch (error) {
        console.error("Error analyzing Main move:", error);
    } finally {
        setIsMainAnalyzing(false);
    }
};


const handlePvPieceDrop = async ({ sourceSquare, targetSquare, piece }) => {
    if (!pvChess) {
        return false;
    }


    try {
        const fenBefore = pvChess.fen();
        const testChess = new Chess(fenBefore);
        
        const move = testChess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        });


        if (move === null) {
            return false;
        }
        
        const newFen = testChess.fen();
        const uciMove = move.from + move.to + (move.promotion || '');
        
        setCustomPvFen(newFen);
        setIsCustomPv(true);
        setPvChess(testChess);
        setIsPvAnalyzing(true);
        setPvGrade(null);
        setPvEvaluation(null);


        
        
        await analyzePvMove(fenBefore, newFen, uciMove);


        return true;
    } catch (error) {
        console.error("Error in handlePvPieceDrop:", error);
        setIsPvAnalyzing(false);
        return false;
    }
};


const analyzePvMove = async (fenBefore, fenAfter, uciMove) => {
    const username = localStorage.getItem("currentUser");
    
    try {
        const stockfishService = stockfishServiceRef.current;
        if (!stockfishService) {
            console.warn("Stockfish not ready");
            setIsPvAnalyzing(false);
            return;
        }


        const analysisBefore = await stockfishService.analyzeFen(fenBefore, { depth: 15 });
        const analysisAfter = await stockfishService.analyzeFen(fenAfter, { depth: 15 });
        
        if (analysisAfter?.bestmove && analysisAfter.bestmove.length >= 4) {
            setPvArrows([{
                startSquare: analysisAfter.bestmove.substring(0, 2),
                endSquare: analysisAfter.bestmove.substring(2, 4),
                color: "green"
            }]);
        } else {
            setPvArrows([]);
        }
        
        const bestmove = analysisBefore?.bestmove;
        let bestFen = null;
        let bestAnalysis = null;
        
        if (bestmove) {
            const chessForBest = new Chess(fenBefore);
            const bestMoveResult = chessForBest.move({
                from: bestmove.slice(0, 2),
                to: bestmove.slice(2, 4),
                promotion: bestmove[4] || 'q'
            });
            
            if (bestMoveResult) {
                bestFen = chessForBest.fen();
                bestAnalysis = await stockfishService.analyzeFen(bestFen, { depth: 14 });
            }
        }


        const fens = [fenBefore, fenAfter];
        const results = [
            { fen: fenBefore, analysis: analysisBefore },
            { fen: fenAfter, analysis: analysisAfter }
        ];
        const bestfens = [bestFen];
        const bestresults = [
            bestFen ? { fen: bestFen, analysis: bestAnalysis } : null
        ];


        const storeResponse = await fetch(`${API_URL}/wasmResultsPv`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fens,
                results,
                bestfens,
                bestresults,
                username
            }),
        });


        if (!storeResponse.ok) {
            throw new Error("Failed to store WASM results");
        }


        await new Promise(resolve => setTimeout(resolve, 200));


        const gradeResponse = await fetch(`${API_URL}/gradePvMove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                playedMove: uciMove,
                fenBefore
            }),
        });


        if (gradeResponse.ok) {
            const gradeData = await gradeResponse.json();
            setPvGrade(gradeData.grade);
            setPvEvaluation(gradeData.evaluation);
        } else {
            console.error("Grading failed:", await gradeResponse.text());
        }


    } catch (error) {
        console.error("Error analyzing PV move:", error);
    } finally {
        setIsPvAnalyzing(false);
    }
};


    const flipboard = () => {
        if (boardOrientation === "white") {
            setboardOrientation("black");
            const temp = whiteuname;
            setwhiteuname(blackuname);
            setblackuname(temp);
        } else {
            setboardOrientation("white");
            const temp = whiteuname;
            setwhiteuname(blackuname);
            setblackuname(temp);
        }
    };


const showtactic = () => {
    if (!pvtrying) {
        setSavedCount(Count);
        setpvindex(Count);
        setpvframe(0);
        setmainboard("none");
        setIsCustomPv(false);
        setPvGrade(null);
        setPvEvaluation(null);
        setIsPvAnalyzing(false);
        
        const initialPv = pvfen[Count - 1] || [];
        const initialFen = initialPv[0] || new Chess().fen();
        setCustomPvFen(initialFen);
        setPvChess(new Chess(initialFen));
        
    } else {
        setCount(savedCount);
        setmainboard("");
        setIsCustomPv(false);
        setCustomPvFen(null);
        setPvChess(null);
        setPvGrade(null);
        setPvEvaluation(null);
        setIsPvAnalyzing(false);
    }
    setpvtrying(prev => !prev);
};


const increase = () => {
    if (pvtrying) {
        const currentpv = pvfen[pvindex - 1] || [];
        const maxFrame = Math.min(13, currentpv.length) - 1;
        if (pvframe < maxFrame) {
            setpvframe(pvframe + 1);
            setIsCustomPv(false);
            setPvGrade(null);
            setPvEvaluation(null);
            setIsPvAnalyzing(false);
            setPvArrows([]); 
        }
    } else {
        if (Count < derivedData.fens.length - 1) {
            setCount(Count + 1);
            setIsCustomMain(false);
            setMainGrade(null);
            setMainEvaluation(null);
            setMainArrows([]);
        }
    }
};


const decrease = () => {
    if (pvtrying) {
        if (pvframe > 0) {
            setpvframe(pvframe - 1);
            setIsCustomPv(false);
            setPvGrade(null);
            setPvEvaluation(null);
            setIsPvAnalyzing(false);
            setPvArrows([]); 
        }
    } else {
        if (Count > 0) {
            setCount(Count - 1);
            setIsCustomMain(false);
            setMainGrade(null);
            setMainEvaluation(null);
            setMainArrows([]);
        }
    }
};


const reset = () => {
    if (pvtrying) {
        setpvframe(0);
        setIsCustomPv(false);
        setPvGrade(null);
        setPvEvaluation(null);
        setIsPvAnalyzing(false);
        setPvArrows([]); 
    } else {
        setCount(0);
        setIsCustomMain(false);
        setMainGrade(null);
        setMainEvaluation(null);
        setMainArrows([]);
    }
};


    const onstartreview = () => {
        setReviewStarted(true);
        setdisplayansidebar("");
    };


    function squareCornerPosition(square, boardSize, iconSize = 0.05625 * boardSize, corner = "top-left") {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square[1], 10) - 1;
        const squareSize = boardSize / 8;


        let left = file * squareSize;
        let top = (7 - rank) * squareSize;


        if (boardOrientation === "black") {
            left = (7 - file) * squareSize;
            top = rank * squareSize;
        }


        let offsetX = 0.65 * squareSize;
        let offsetY = 0.3125 * squareSize;
        
        if (corner === "top-right") {
            offsetX = squareSize - iconSize - 0.1 * squareSize;
            offsetY = 0.125 * squareSize;
        } else if (corner === "bottom-left") {
            offsetX = 0.15 * squareSize;
            offsetY = squareSize - iconSize - 0.125 * squareSize;
        } else if (corner === "bottom-right") {
            offsetX = squareSize - iconSize - 0.1 * squareSize;
            offsetY = squareSize - iconSize - 0.125 * squareSize;
        }
        
        return { left: left + offsetX, top: top + offsetY };
    }


    const userrealrating = Math.round(((0.5 * userrating) + (0.5 * userevalrating)) / 50) * 50;
    const opprealrating = Math.round(((0.5 * opprating) + (0.5 * oppevalrating)) / 50) * 50;


    const currentpv = pvfen[pvindex - 1] || [];
    const safeCount = Math.min(Math.max(Count, 0), derivedData.fens.length - 1);
    const evaled = Count > 1 ? Math.floor((Count - 1)) : -1;


const options = {
    position: customMainFen || derivedData.fens[safeCount],
    id: "board",
    arrows: isCustomMain ? mainArrows : arrows,
    boardOrientation: boardOrientation,
    onPieceDrop: handleMainPieceDrop,
    draggable: true,
    draggingPieceGhostStyle: { opacity: 0 }
};


const pvoptions = {
    position: customPvFen || (pvtrying && currentpv ? currentpv[pvframe] || new Chess().fen() : new Chess().fen()),
    boardOrientation: boardOrientation,
    onPieceDrop: handlePvPieceDrop,
    draggable: true,
    draggingPieceGhostStyle: { opacity: 0 },
    arrows: pvArrows,
    id: "pv-board"
};


    return (
        <div className="analytics-root">
            {windowWidth > 768 ? (<Sidebars />) : (<UniqueSidebars />)}


            <div className="boardplusside">
                <div className="boardpluseval">
                    <div className="analytics-evalbar">
                        <Evalbar cp={userwinpercents[evaled] ?? 53} />
                    </div>
                    <div className={`analytics-board-container${mainboard === "none" ? " analytics-board-hidden" : ""}`} ref={boardRef}>
                        <div className="analytics-board-header">
                            <header>{blackuname}</header>
                                    <div className="analytics-time-display">
                                    {blackTimeStrings && <span className="time-square time-square-black">{blackTime}</span>}
                                    </div>
                        </div>
                        <Chessboard options={options} />
                        <div className="analytics-board-footer">
                            <footer>{whiteuname}</footer>
                                    <div className="analytics-time-display">
                                        {whiteTimeStrings && <span className="time-square time-square-white">{whiteTime}</span>}
                                     </div>
                        </div>
                        {(() => {
                            if (pvtrying) return null;
                            
                            if (isCustomMain && mainChess) {
                                const history = mainChess.history({ verbose: true });
                                if (history.length === 0) return null;
                                
                                const lastMove = history[history.length - 1];
                                const square = lastMove.to;
                                
                                const iconSize = 0.05 * boardSize;
                                const { left, top } = squareCornerPosition(square, boardSize, iconSize, "top-left");
                                
                                if (isMainAnalyzing) {
                                    return (
                                        <div
                                            className="analytics-icon-container"
                                            style={{
                                                left: left,
                                                top: top,
                                                width: iconSize,
                                                height: iconSize,
                                                position: 'absolute'
                                            }}
                                        >
                                            <div 
                                                className="analytics-loading-spinner"
                                                style={{ 
                                                    width: iconSize*0.8, 
                                                    height: iconSize*0.8,
                                                    border: `${Math.max(2,iconSize*0.8 * 0.15)}px solid rgba(255, 255, 255, 0.3)`,
                                                    borderTop: `${Math.max(2, iconSize*0.8 * 0.15)}px solid white`,
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    );
                                }
                                
                                if (mainGrade) {
                                    const Icon = iconMap[mainGrade];
                                    if (!Icon) return null;
                                    
                                    return (
                                        <div
                                            className="analytics-icon-container"
                                            style={{
                                                left: left,
                                                top: top,
                                                width: iconSize,
                                                height: iconSize,
                                                position: 'absolute'
                                            }}
                                        >
                                            {showIcon && (
                                                <Icon 
                                                    className="analytics-move-icon-svg" 
                                                    style={{ width: iconSize, height: iconSize }} 
                                                />
                                            )}
                                        </div>
                                    );
                                }
                                
                                return null;
                            }
                            
                            if (Count > 1) {
                                const moveindex = Count - 1;
                                if (moveindex < 0) return null;
                                const square = derivedData.toSquare[moveindex];
                                const grade = grading[moveindex - 1];
                                const Icon = iconMap[grade];
                                if (!square || !Icon) return null;
                                const iconSize = 0.05 * boardSize;
                                const { left, top } = squareCornerPosition(square, boardSize, iconSize, "top-left");
                                return (
                                    <div
                                        className="analytics-icon-container"
                                        style={{
                                            left: left,
                                            top: top,
                                            width: iconSize,
                                            height: iconSize
                                        }}
                                    >
                                        {showIcon && (
                                            <Icon className="analytics-move-icon-svg" style={{ width: iconSize, height: iconSize }} />
                                        )}
                                    </div>
                                );
                            }
                            
                            return null;
                        })()}
                    </div>
{pvtrying && (
    <div className="analytics-board-container" ref={pvBoardRef}>
        <div className="analytics-board-header">
            <header>{blackuname}</header>
        </div>
        <Chessboard options={pvoptions} />
        <div className="analytics-board-footer">
            <footer>{whiteuname}</footer>
        </div>
        
        {isCustomPv && pvChess && (() => {
            const history = pvChess.history({ verbose: true });
            if (history.length === 0) return null;
            
            const lastMove = history[history.length - 1];
            const square = lastMove.to;
            
            const iconSize = 0.05 * pvBoardSize;
            const { left, top } = squareCornerPosition(square, pvBoardSize, iconSize, "top-left");
            
            if (isPvAnalyzing) {
                return (
                    <div
                        className="analytics-icon-container"
                        style={{
                            left: left,
                            top: top,
                            width: iconSize,
                            height: iconSize,
                            position: 'absolute'
                        }}
                    >
                        <div 
                            className="analytics-loading-spinner"
                    style={{ 
                        width: iconSize*0.8, 
                        height: iconSize*0.8,
                        border: `${Math.max(2,iconSize*0.8 * 0.15)}px solid rgba(255, 255, 255, 0.3)`,
                        borderTop: `${Math.max(2, iconSize*0.8 * 0.15)}px solid white`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        boxSizing: 'border-box'
                    }}
                        />
                    </div>
                );
            }
            
            if (pvGrade) {
                const Icon = iconMap[pvGrade];
                if (!Icon) return null;
                
                return (
                    <div
                        className="analytics-icon-container"
                        style={{
                            left: left,
                            top: top,
                            width: iconSize,
                            height: iconSize,
                            position: 'absolute'
                        }}
                    >
                        {showIcon && (
                            <Icon 
                                className="analytics-move-icon-svg" 
                                style={{ width: iconSize, height: iconSize }} 
                            />
                        )}
                    </div>
                );
            }
            
            return null;
        })()}
    </div>
)}
                </div>
                <div className="anbar">
                    {windowWidth > 768 ? (
                        <Ansidebar
                            onIncrease={increase}
                            onDecrease={decrease}
                            onReset={reset}
                            movelist={moves}
                            pgn={pgn}
                            counting={Count}
                            display={displyansidebar}
                            onflip={flipboard}
                            showtactic={showtactic}
                            pvtrying={pvtrying}
                            booknames={booknames}
                            handlecount={handlecount}
                        />
                    ) : (
                        <AnsidebarHorizontal                      
                            onIncrease={increase}
                            onDecrease={decrease}
                            onReset={reset}
                            movelist={moves}
                            pgn={pgn}
                            counting={Count}
                            display={displyansidebar}
                            onflip={flipboard}
                            showtactic={showtactic}
                            pvtrying={pvtrying}
                            booknames={booknames}
                            handlecount={handlecount}
                        />
                    )}
                </div>
            </div>
            {!reviewStarted && (
                <div className="gamebox">      
                    <GameSummaryBox 
                        white={{ 
                            name: `${isWhite ? userusername : oppusername}`, 
                            accuracy: `${whiteaccuracy}`, 
                            elo: `${isWhite ? userrealrating : opprealrating}`, 
                            good: { 
                                Best: grademovenumber[0], 
                                Great: grademovenumber[5], 
                                Okay: grademovenumber[3], 
                                Good: grademovenumber[4],
                                Brilliant: grademovenumber[7] 
                            }, 
                            bad: { 
                                Mistake: grademovenumber[1], 
                                Inaccuracy: grademovenumber[6], 
                                Blunder: grademovenumber[2],
                                Miss: grademovenumber[8],
                                Mate: grademovenumber[9] 
                            } 
                        }}
                        black={{ 
                            name: `${isWhite ? oppusername : userusername}`, 
                            accuracy: `${blackaccuracy}`, 
                            elo: `${isWhite ? opprealrating : userrealrating}`, 
                            good: { 
                                Best: blackgradeno[0], 
                                Great: blackgradeno[5], 
                                Okay: blackgradeno[3], 
                                Good: blackgradeno[4],
                                Brilliant: blackgradeno[7] 
                            }, 
                            bad: { 
                                Mistake: blackgradeno[1], 
                                Inaccuracy: blackgradeno[6], 
                                Blunder: blackgradeno[2],
                                Miss: blackgradeno[8],
                                Mate: blackgradeno[9] 
                            } 
                        }}
                        onreview={onstartreview}
                    />
                </div> 
            )}
        </div>
    );
};


export default Analytics;
