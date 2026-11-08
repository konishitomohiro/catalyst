// 画面と API で共通の上限（例/Docs/9_直すこと.md #10）

/** 1回の発言の最大文字数。ブラウザの文字起こしの1区切りは、ふつう数十〜百数十文字 */
export const MAX_UTTERANCE = 500;
/** 参考に渡す直前の会話の最大文字数 */
export const MAX_CONTEXT = 1500;
/** 送り手の確認（伝える前）で、1回に確かめる文章の最大文字数 */
export const MAX_MESSAGE = 1000;
