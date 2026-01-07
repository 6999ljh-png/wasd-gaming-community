import { projectId } from './supabase/info';

/**
 * 自动更新用户的游戏偏好标签
 * 基于用户实际匹配的游戏记录
 */
export async function updateGamePreferences(
  gameId: string,
  accessToken: string,
  userId: string
): Promise<string[] | null> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${userId}/game-preferences`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.gamePreferences;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating game preferences:', error);
    return null;
  }
}

/**
 * 映射游戏ID到偏好标签ID
 * Random Match的游戏ID -> GamePreferenceTags的游戏ID
 */
export const GAME_ID_MAPPING: Record<string, string> = {
  'lol': 'lol',
  'valorant': 'valorant',
  'apex': 'apex',
  'ow2': 'overwatch',
  'genshin': 'genshin',  // 可能需要新增这个
  'minecraft': 'minecraft',  // 可能需要新增这个
  'cs2': 'csgo',  // CS2 映射到 CS:GO
  'dota2': 'dota2',
};
