import React, { useEffect, useState } from "react";

const Ansidebar = ({ handlecount,onIncrease, onDecrease, onReset, movelist, pgn,counting,display ,onflip ,showtactic ,pvtrying ,booknames}) => {
 const myarray = movelist.slice(0, counting);
 const [opening,setopening] = useState("");
 const [showPrivacy, setShowPrivacy] = useState(false);


 useEffect( () =>
{

  
 const getopening = () =>
 {
    const ecoUrlMatch = pgn.match(/\[ECOUrl\s+"([^"]+)"\]/);
    if (ecoUrlMatch) {
        const url = ecoUrlMatch[1];
        const openingPart = url.split('/openings/')[1];
        if (openingPart) {
            let name = openingPart
                .split('-')
                .slice(0, 6) 
                .join(' ')
                .replace(/\d+.*$/, '') 
                .replace(/\.\.\.$/, '') 
                .trim();
            
            if (name && name.length > 3) {
                
                setopening(name);
            }
        }
    } else {
  setopening(booknames[booknames.length-1]);
}
 }
 getopening();
},[pgn ,counting ,booknames] );



    useEffect(() => {
        const handleKeyDown = (e) => {
          if (pvtrying ) return;
            if (e.key === "ArrowRight") {
                onIncrease();
                e.preventDefault();
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
                onDecrease();
            }
            else if (e.key=== "Escape")
            {
              onReset();
              e.preventDefault();
            }
        };
      

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onIncrease, onDecrease]);
  


  return (
    <div style={{...styles.sidebar ,display}}>
      
      <div style={styles.moveBox}>
      
        <h3 style={styles.moveTitle}>Move Log </h3>
        <h4>{opening}</h4>
       <div style={{display:"flex", gap :"10px", flexWrap:"wrap"}}>
  {movelist.map((m, index) => (
    <button
      key={index}
      style={{
        ...styles.btn,
        backgroundColor: index === counting- 1? "#ffe5d9" : "transparent", 
        fontWeight: index === counting -1 ? "bold" : "normal",
      }}
      onClick={() => {
        if (typeof handlecount === "function") handlecount(index);
        else console.error("handlecount is not a function", handlecount);
      }}
    >
      {m}
    </button>
  ))}
</div>
        <div style={styles.moveContent}>
          
        </div>
      </div>

      <div style={styles.controls} >
        <button style={styles.btnn} onClick={showtactic}>{!pvtrying ? "Show Tactic" : "Hide tactic"}</button>
        <div style={styles.buttonRow}>
          <button style={styles.buttonn} onClick={onDecrease} title="Previous">◀</button>
          <button style={styles.buttonn} onClick={onIncrease} title="Next">▶</button>
          <button style={styles.buttonn} onClick={onReset} title="Reset">⟲</button>
          <button style={{...styles.buttonn, ...styles.flipButton}} onClick={onflip} disabled={pvtrying} title="Flip Board">🔁</button>
        </div>
      </div>

      <div style={styles.adBox}>
        <p style={styles.adText}>Advertisement Space</p>
      </div>

      <div style={styles.footer}>
        <button style={styles.privacyLink} onClick={() => setShowPrivacy(!showPrivacy)}>
          Privacy Policy
        </button>
      </div>

      {showPrivacy && (
        <div style={styles.modal} onClick={() => setShowPrivacy(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowPrivacy(false)}>✕</button>
            <h2>Privacy Policy</h2>
            <div style={styles.modalScroll}>
              <p><strong>Last updated:</strong> October 6, 2025</p>
              
              <h3>Information We Collect</h3>
              <p>This Application does not collect or store personal information.</p>
              
              <h3>Cookies</h3>
              <p>We use cookies to improve user experience and for analytics purposes.</p>
              
              <h3>Third-Party Services</h3>
              <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites.</p>
              <p>You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{color: '#4a90e2'}}>Google Ads Settings</a>.</p>
              
            <h3>Data Security</h3>
            <p>Your chess game data is processed in your browser. The chess games and tactics data is sourced from publicly available chess databases.</p>
            <p>We implement industry-standard security measures to protect your data. No sensitive personal information is stored on our servers.</p> 
              
              <h3>Changes to This Policy</h3>
              <p>We may update this privacy policy from time to time. Changes will be posted here.</p>
              
              {/* <h3>Contact</h3>
              <p>Questions? Contact us at: <a href="https://github.com/Daksh-chhabra" target="_blank" rel="noopener noreferrer" style={{color: '#4a90e2'}}>@Daksh-chhabra</a></p> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  sidebar: {
    width: "350px",
    padding: "20px",
    backgroundColor: "#1a0909ff",
    borderLeft: "2px solid #ccc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "sans-serif",
    height: "100vh",
    boxSizing: "border-box",
  },
  moveBox: {
    width: "100%",
    aspectRatio: "1 / 1",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "20px",
    backgroundColor: "#fff",
    overflowY: "auto",
  },
  moveTitle: {
    margin: 0,
    fontSize: "18px",
    marginBottom: "10px",
    textAlign: "center",
  },
  moveContent: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn :{
    color :"black",
    padding : "0",
    gap :"0px"
  },

  buttonn: {
    padding: "10px 15px",
    fontSize: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #aaa",
    backgroundColor: "#eee",
    cursor: "pointer",
    transition: "all 0.2s",
    color :"black",
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flipButton: {
    maxWidth: "60px",
  },
  btnn :{
    color : "white",
    width : "fit-content",
    padding: "5px 10px",
    fontSize: "0.9rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  adBox: {
    width: "100%",
    height: "100px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "42%",
    overflow: 'hidden',
  },
  adText: {
    color: "#999",
    fontSize: "14px",
    margin: 0,
  },
  footer: {
    width: "100%",
    padding: "10px 0",
    textAlign: "center",
  },
  privacyLink: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: "11px",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "5px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "30px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    position: "relative",
    color: "#333",
  },
  modalScroll: {
    overflowY: "auto",
    maxHeight: "60vh",
  },
  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  }
};

export default Ansidebar;