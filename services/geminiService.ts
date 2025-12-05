import { GoogleGenAI } from "@google/genai";
import { GameType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTaunt = async (game: GameType, score: number): Promise<string> => {
  if (!apiKey) {
    return "达文西正在无视你（缺少 API Key）。";
  }

  const modelId = "gemini-2.5-flash";
  
  let gameName = "";
  switch(game) {
    case GameType.REVERSE_TETRIS: gameName = "反向俄罗斯方块"; break;
    case GameType.ROTATED_SNAKE: gameName = "旋转贪吃蛇"; break;
    case GameType.COWARDLY_BUTTON: gameName = "胆小鬼按钮"; break;
    case GameType.INVERSE_MAZE: gameName = "反向迷宫"; break;
    case GameType.COLOR_LIAR: gameName = "色彩骗局"; break;
    case GameType.TROLL_MATH: gameName = "智障算术"; break;
    default: gameName = "这个游戏";
  }

  const prompt = `
    你现在是达文西（Leonardo da Vinci），一个性格古怪、喜欢恶作剧、极其痛恨肌肉记忆的游戏设计师。
    玩家刚刚在你的游戏 "${gameName}" 中输了，得分为 ${score}。
    
    请用中文生成一句非常简短、机智且带点刻薄的嘲讽，嘲笑他们缺乏适应能力或手脚不协调。
    不要超过30个字。要好笑但扎心。不要太正式，要像个损友。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating taunt:", error);
    return "甚至连我的AI都对你感到无语了。";
  }
};