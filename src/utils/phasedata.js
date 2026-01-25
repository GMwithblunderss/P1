import { supabase, setUserContext } from './supabase.js';

export const getUserPhaseStats = async (username) => {
  try {
    if (!username) {
      throw new Error('Username is required');
    }

    await setUserContext(username);
    
    const { data, error } = await supabase
      .from('user_phase_stats')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      username: data.username,
      total_games: data.total_games || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      draws: data.draws || 0,
      avg_game_length: data.avg_game_length || 0,
      
      opening_accuracy: data.opening_accuracy || 0,
      opening_avg_grade: data.opening_avg_grade || 0,
      opening_total_moves: data.opening_total_moves || 0,
      opening_blunders: data.opening_blunders || 0,
      opening_mistakes: data.opening_mistakes || 0,
      opening_excellent: data.opening_excellent || 0,
      opening_development_moves: data.opening_development_moves || 0,
      opening_advantage_conversion_accuracy: data.opening_advantage_conversion_accuracy || 75,
      opening_defensive_hold_accuracy: data.opening_defensive_hold_accuracy || 75,
      opening_equal_position_accuracy: data.opening_equal_position_accuracy || 75,
      opening_unforced_errors: data.opening_unforced_errors || 0,
      opening_initiative_score: data.opening_initiative_score || 0,
      
      middlegame_accuracy: data.middlegame_accuracy || 0,
      middlegame_avg_grade: data.middlegame_avg_grade || 0,
      middlegame_total_moves: data.middlegame_total_moves || 0,
      middlegame_blunders: data.middlegame_blunders || 0,
      middlegame_mistakes: data.middlegame_mistakes || 0,
      middlegame_excellent: data.middlegame_excellent || 0,
      middlegame_tactical_moves: data.middlegame_tactical_moves || 0,
      middlegame_advantage_conversion_accuracy: data.middlegame_advantage_conversion_accuracy || 75,
      middlegame_defensive_hold_accuracy: data.middlegame_defensive_hold_accuracy || 75,
      middlegame_equal_position_accuracy: data.middlegame_equal_position_accuracy || 75,
      middlegame_unforced_errors: data.middlegame_unforced_errors || 0,
      middlegame_initiative_score: data.middlegame_initiative_score || 0,
      
      endgame_accuracy: data.endgame_accuracy || 0,
      endgame_avg_grade: data.endgame_avg_grade || 0,
      endgame_total_moves: data.endgame_total_moves || 0,
      endgame_blunders: data.endgame_blunders || 0,
      endgame_mistakes: data.endgame_mistakes || 0,
      endgame_excellent: data.endgame_excellent || 0,
      endgame_technique_score: data.endgame_technique_score || 0,
      endgame_advantage_conversion_accuracy: data.endgame_advantage_conversion_accuracy || 75,
      endgame_defensive_hold_accuracy: data.endgame_defensive_hold_accuracy || 75,
      endgame_equal_position_accuracy: data.endgame_equal_position_accuracy || 75,
      endgame_unforced_errors: data.endgame_unforced_errors || 0,
      endgame_initiative_score: data.endgame_initiative_score || 0,
    };

  } catch (error) {
    console.error('Error fetching user phase stats:', error);
    throw error;
  }
};
