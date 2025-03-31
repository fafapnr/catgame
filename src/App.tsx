import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "@headlessui/react";

const levelConfigs = [
  { gridSize: 5, scoreNeeded: 15, message: "เก่งมากพี่แมวส้ม" },
  { gridSize: 6, scoreNeeded: 20, message: "เล่นต่อหน่อยๆ 🥹" },
  { gridSize: 6, scoreNeeded: 25, message: "หนูมีคำถามๆ ปวดตามั้ย หยอกกก" },
  {
    gridSize: 7,
    scoreNeeded: 50,
    message:
      "อยากถามว่า อยากสนิทกับพี่ต้องทำยังไง\nอยากรู้จัก พี่น่ารัก ;-;",
  },
];

const gemTypes = [
  "/oia1.webp",
  "/oia2.jpeg",
  "/oia3.jpg",
  "/oia4.jpg",
  "/oia5.webp",
  "/oia6.jpg",
];

function getRandomGem() {
  return gemTypes[Math.floor(Math.random() * gemTypes.length)];
}

function checkForInitialMatches(board: string[], gridSize: number): boolean {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize - 2; j++) {
      const idx = i * gridSize + j;
      if (
        board[idx] === board[idx + 1] &&
        board[idx] === board[idx + 2]
      )
        return true;
    }
  }
  for (let i = 0; i < gridSize - 2; i++) {
    for (let j = 0; j < gridSize; j++) {
      const idx = i * gridSize + j;
      if (
        board[idx] === board[idx + gridSize] &&
        board[idx] === board[idx + gridSize * 2]
      )
        return true;
    }
  }
  return false;
}

function createBoard(gridSize: number): string[] {
  let board: string[];
  do {
    board = Array.from(
      { length: gridSize * gridSize },
      getRandomGem
    );
  } while (checkForInitialMatches(board, gridSize));
  return board;
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState<string[]>(
    createBoard(levelConfigs[0].gridSize)
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const gridSize = levelConfigs[level].gridSize;
  const scoreNeeded = levelConfigs[level].scoreNeeded;
  const levelMessage = levelConfigs[level].message;

  const isAdjacent = (i: number, j: number) => {
    const row1 = Math.floor(i / gridSize);
    const row2 = Math.floor(j / gridSize);
    const col1 = i % gridSize;
    const col2 = j % gridSize;
    return (
      (row1 === row2 && Math.abs(col1 - col2) === 1) ||
      (col1 === col2 && Math.abs(row1 - row2) === 1)
    );
  };

  const swap = (i: number, j: number) => {
    const newBoard = [...board];
    [newBoard[i], newBoard[j]] = [newBoard[j], newBoard[i]];
    setBoard(newBoard);
  };

  const checkMatches = () => {
    const matched = new Set<number>();
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize - 2; j++) {
        const idx = i * gridSize + j;
        if (
          board[idx] === board[idx + 1] &&
          board[idx] === board[idx + 2]
        ) {
          matched.add(idx);
          matched.add(idx + 1);
          matched.add(idx + 2);
        }
      }
    }
    for (let i = 0; i < gridSize - 2; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j;
        if (
          board[idx] === board[idx + gridSize] &&
          board[idx] === board[idx + gridSize * 2]
        ) {
          matched.add(idx);
          matched.add(idx + gridSize);
          matched.add(idx + gridSize * 2);
        }
      }
    }
    if (matched.size > 0) {
      const newBoard = [...board];
      matched.forEach((idx) => {
        newBoard[idx] = getRandomGem();
      });
      setBoard(newBoard);
      setScore((prev) => prev + matched.size);
    }
  };

  useEffect(() => {
    if (hasInteracted) {
      checkMatches();
    }
  }, [board]);

  useEffect(() => {
    if (score >= scoreNeeded) {
      setTimeout(() => setShowPopup(true), 300);
    }
  }, [score]);

  const handleNextLevel = () => {
    const nextLevel = level + 1;
    if (nextLevel < levelConfigs.length) {
      setLevel(nextLevel);
      setScore(0);
      setHasInteracted(false);
      setBoard(createBoard(levelConfigs[nextLevel].gridSize));
      setShowPopup(false);
    } else {
      setShowPopup(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins flex flex-col items-center justify-center p-6 text-center text-gray-800">
      <audio ref={audioRef} src="/catsong.mp3" loop className="hidden" />

      {!started ? (
        <div>
          <h1 className="text-2xl font-semibold text-pink-600 mb-1">
            for p'แมวส้ม only
          </h1>
          <p className="text-base text-gray-600 mb-4">
            มีเกมแมวมาให้เล่น ลองดูมั้ย
          </p>

          <img
            src="https://www.icegif.com/wp-content/uploads/2024/05/cat-icegif-6.gif"
            alt="cat gif"
            className="mx-auto mb-4 w-48 rounded-xl shadow"
          />

          <p className="text-sm text-gray-500 mb-6">
            <strong>how to play:</strong> กดแมวค้างไว้แล้วลากให้ครบ 3 ตัวในแถวหรือคอลัมน์
          </p>

          <button
            onClick={() => {
              setStarted(true);
              setLevel(0);
              setScore(0);
              setHasInteracted(false);
              setBoard(createBoard(levelConfigs[0].gridSize));
              audioRef.current?.play();
            }}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-full transition"
          >
            ลองๆ
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center">
  <h1 className="text-xl sm:text-2xl font-semibold">
    Level {level + 1} —{" "}
    <span className="text-pink-500">Score: {score}/{scoreNeeded}</span>
  </h1>
  {level === 0 && (
    <p className="text-sm text-gray-600 mt-1">
      กดน้องแมวค้างแล้วลากนะ ไม่งั้นน้องไม่ไป 🐾
    </p>
  )}
  {level === 3 && (
    <p className="text-sm text-gray-600 mt-1">
      ด่านสุดท้ายแล้ว เก่งมากก 💪
    </p>
  )}
</div>



          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {board.map((gem, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", i.toString());
                    setDraggedIndex(i);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const targetIndex = i;
                    const sourceIndex = draggedIndex;
                    if (
                      sourceIndex !== null &&
                      isAdjacent(sourceIndex, targetIndex)
                    ) {
                      swap(sourceIndex, targetIndex);
                      setHasInteracted(true);
                    }
                    setDraggedIndex(null);
                  }}
                  className={`aspect-square w-full bg-white flex items-center justify-center rounded shadow-md cursor-move overflow-hidden border-2 ${
                    draggedIndex === i
                      ? "border-pink-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={gem}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <Dialog
            open={showPopup}
            onClose={() => {}}
            className="fixed z-10 inset-0 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-30 p-4">
              <Dialog.Panel className="bg-white rounded-2xl p-6 text-center shadow-xl">
                <Dialog.Title className="text-2xl font-bold text-pink-600">
                  {level === 3 ? "Game Ended 🎉" : "ผ่านด่านแล้ว! 🎉"}
                </Dialog.Title>

                <p className="mt-3 text-pink-600 text-lg whitespace-pre-line">
                  {levelMessage}
                </p>

                <button
                  onClick={handleNextLevel}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600"
                >
                  {level === 3 ? "Ended" : "Next Level"}
                </button>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
}
