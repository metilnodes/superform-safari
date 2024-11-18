'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

const GRID_SIZE = 12
const INITIAL_PLAYER_POS = { x: 0, y: 0 }
const INITIAL_ENEMIES = [
  { x: 11, y: 11 },
  { x: 11, y: 0 },
  { x: 0, y: 11 },
  { x: 5, y: 5 },
  { x: 7, y: 7 },
  { x: 3, y: 9 },
]
const INITIAL_FOOD = [
  { x: 3, y: 3 },
  { x: 3, y: 8 },
  { x: 8, y: 3 },
  { x: 8, y: 8 },
  { x: 2, y: 2 },
  { x: 2, y: 9 },
  { x: 9, y: 2 },
  { x: 9, y: 9 },
]

const AVATARS = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FrogSuperform__1-ITDMHNiPxG3Y5nJ3sUUmgPHcaAEVW2.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chad_finish-u8kDRSefTNC961PNSk9oDyVBs6Tw8A.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-01-gAjjMJfjOgWrO6diYOEaF7Yge2Ok81.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7519.PNG-EhDRiHoEQ3y3FzOZmgxmN7pE8VP6nX.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crouton-3R0vEjxzy5GUXbfKQvi6gVtu2X4XlJ.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/for_video-BydBiHUpXRjxi58oC7GgyyF1EQEv2x.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/24-27df9QIntZmoT02lQFwS87Ck47B8LL.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38-hIkQijZoYkT7P7LgJVmpttsRoEXXCM.png"
]

const PIGGY_IMAGES = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Drool%20-%20rifolin-DpTYKK2zhcx6VbSLUhTsPxn7RsXH4v.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Hmm%20-%20rifolin-QkPNUC7I3la46g3USm2aoy6F1BuT2i.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Angry%20-%20rifolin-OTuntp6G1gQOZotDPf68fjMhAyZyXW.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20French%20-%20rifolin-saVhWMZkVs7iD4uapOpT2c3E9OAHvl.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Rekt%20-%20rifolin-Ni4WDi3t8y61Uuut2YG3Ljt7zEUH6C.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Pyramid%20-%20rifolin-ZrGtqAjKnupr0sqtcnfu3Iwf9Kb87F.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Cool%20-%20rifolin-zbz5NO65bdVHhXUn4zxXAxdSf706xz.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Sad%20-%20rifolin-WmWaANoQC9SrCTf2K63RvVfAOAbkVO.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piggy%20Redeye%20-%20rifolin-1bTF8Y9VGwHhe3yf2a1uCjNXjwQaE6.png',
]

const ENEMY_IMAGES = {
  0: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-oF8OHlMohXJ9MrIIO57lVMrUWu55YH.png",
  1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-1-ZKbZLxkkn6mgMLI9jAY0sYMbKvjjsM.png",
  2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-2-puqK7HTjojV52SzdHMv8LEeqgtbzHE.png",
  3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-3-mDJfWWshKN2a4mtzBppQhjTxcjefiL.png",
  4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-4-Rf5ajYEsuNZWIhAcGIwe7ltx5g8UKR.png",
  5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-5-EnUJZvLyBaradKJXfqYgOgrTxDP661.png",
  6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-6-Fi1Vm2KUkrQroJporUV6yndDz3fQs5.png"
}

type Position = { x: number; y: number }

type LeaderboardEntry = {
  nickname: string;
  score: number;
  tournament: number;
}

const updateLeaderboard = () => {
  setLeaderboard(prev => {
    const newEntry = { nickname, score, tournament }
    const newLeaderboard = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    return newLeaderboard
  })
}

export default function Component() {
  const [playerPos, setPlayerPos] = useState<Position>(INITIAL_PLAYER_POS)
  const [enemies, setEnemies] = useState<Position[]>(INITIAL_ENEMIES)
  const [food, setFood] = useState<Position[]>(INITIAL_FOOD)
  const [foodImages, setFoodImages] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [tournament, setTournament] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [nickname, setNickname] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [showAvatarSelect, setShowAvatarSelect] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [lastMoveTime, setLastMoveTime] = useState(Date.now())
  const [moveCount, setMoveCount] = useState(0)

  const startAvatarSelect = () => {
    if (nickname.trim() !== '') {
      setShowAvatarSelect(true)
    }
  }

  const startGame = () => {
    if (selectedAvatar) {
      setGameStarted(true)
      resetGame()
    }
  }

  const resetGame = useCallback(() => {
  // Check dependencies
    if (gameWon || gameOver) {
      updateLeaderboard()
    }
    setPlayerPos(INITIAL_PLAYER_POS)
    setEnemies(INITIAL_ENEMIES)
    setFood(INITIAL_FOOD)
    setScore(0)
    setTournament(0)
    setGameOver(false)
    setGameWon(false)
    setTimeRemaining(30)
    setLastMoveTime(Date.now())
    setMoveCount(0)
    const randomFoodImages = INITIAL_FOOD.map(() => 
      PIGGY_IMAGES[Math.floor(Math.random() * PIGGY_IMAGES.length)]
    )
    setFoodImages(randomFoodImages)
  }, [gameWon, gameOver, updateLeaderboard])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  const addRandomPig = useCallback(() => {
  // Check dependencies
    const newPigPos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    
    const isOccupied = food.some(f => f.x === newPigPos.x && f.y === newPigPos.y) ||
                       enemies.some(e => e.x === newPigPos.x && e.y === newPigPos.y) ||
                       (playerPos.x === newPigPos.x && playerPos.y === newPigPos.y)

    if (!isOccupied) {
      setFood(prevFood => [...prevFood, newPigPos])
      setFoodImages(prevImages => [...prevImages, PIGGY_IMAGES[Math.floor(Math.random() * PIGGY_IMAGES.length)]])
    }
  }, [food, enemies, playerPos])

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      const interval = setInterval(() => {
        if (food.length < 5) {
          addRandomPig();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, gameWon, addRandomPig, food]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameOver || gameWon) return

    setLastMoveTime(Date.now());

    setPlayerPos((prev) => {
      const newPos = { x: prev.x + dx, y: prev.y + dy }
      
      if (newPos.x < 0) newPos.x = GRID_SIZE - 1
      if (newPos.x >= GRID_SIZE) newPos.x = 0
      if (newPos.y < 0) newPos.y = GRID_SIZE - 1
      if (newPos.y >= GRID_SIZE) newPos.y = 0

      if (enemies.some(enemy => enemy.x === newPos.x && enemy.y === newPos.y)) {
        setGameOver(true)
        updateLeaderboard()
        return prev
      }

      const foodIndex = food.findIndex(f => f.x === newPos.x && f.y === newPos.y)
      if (foodIndex !== -1) {
        setScore(prevScore => prevScore + 10)
        setFood(prevFood => prevFood.filter((_, index) => index !== foodIndex))
        setFoodImages(prevImages => prevImages.filter((_, index) => index !== foodIndex))
      }

      return newPos
    })

    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        const dx = Math.random() < 0.5 ? -1 : 1
        const dy = Math.random() < 0.5 ? -1 : 1
        return {
          x: Math.max(0, Math.min(GRID_SIZE - 1, enemy.x + dx)),
          y: Math.max(0, Math.min(GRID_SIZE - 1, enemy.y + dy))
        }
      })
    )

    setMoveCount((prevCount) => {
      const newCount = prevCount + 1
      if (newCount % 3 === 0) {
        addRandomPig()
      }
      return newCount
    })
  }, [gameOver, gameWon, enemies, food, foodImages, addRandomPig])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movePlayer]);

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            setTournament((prevTournament) => {
              const nextTournament = prevTournament + 1
              if (nextTournament > 6) {
                setGameWon(true)
                updateLeaderboard()
                return prevTournament
              }
              return nextTournament
            })
            return 30
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver, gameWon])

  const getEnemyImage = useCallback((level: number) => {
    return ENEMY_IMAGES[level] || ENEMY_IMAGES[0]
  }, [])

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl mx-auto bg-gray-300">
        <CardHeader>
          <CardTitle className="text-center">Superform Safari</CardTitle>
        </CardHeader>
        <CardContent>
          {!gameStarted && !showAvatarSelect && (
            <div className="text-center">
              <Input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mb-2 w-64 mx-auto"
              />
              <Button onClick={startAvatarSelect} disabled={nickname.trim() === ''} className="text-sm">
                Continue
              </Button>
            </div>
          )}
          
          {!gameStarted && showAvatarSelect && (
            <div className="text-center w-full max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-2">Choose Your Character</h3>
              <div className="grid grid-cols-4 gap-2 mb-2 w-full">
                {AVATARS.map((avatar, index) => (
                  <div
                    key={index}
                    className={`p-1 rounded-lg cursor-pointer transition-all ${
                      selectedAvatar === avatar
                        ? 'bg-primary/20 ring-1 ring-primary'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={avatar}
                        alt={`Character ${index + 1}`}
                        width={60}
                        height={60}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={startGame} disabled={!selectedAvatar} className="text-sm">
                Start Game
              </Button>
            </div>
          )}
          
          {gameStarted && (
            <>
              <div className="grid grid-cols-12 gap-1 mb-4">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE
                  const y = Math.floor(i / GRID_SIZE)
                  let content = null
                  if (x === playerPos.x && y === playerPos.y) {
                    content = (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={selectedAvatar}
                          alt="Player"
                          width={30}
                          height={30}
                          className="object-contain"
                        />
                      </div>
                    )
                  } else if (enemies.some((e) => e.x === x && e.y === y)) {
                    content = (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={getEnemyImage(tournament)}
                          alt="Enemy"
                          width={30}
                          height={30}
                          className="object-contain"
                        />
                      </div>
                    )
                  } else {
                    const foodIndex = food.findIndex((f) => f.x === x && f.y === y)
                    if (foodIndex !== -1) {
                      content = (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image
                            src={foodImages[foodIndex]}
                            alt="Food"
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                      )
                    }
                  }
                  return (
                    <div key={i} className="w-[50px] h-[50px] flex items-center justify-center border border-gray-400 bg-gray-300">
                      {content}
                    </div>
                  )
                })}
              </div>
              <div className="text-center mb-4">
                <p className="text-xl font-bold">XP: {score}</p>
                <p className="text-lg">Tournament: {tournament}</p>
                <p className="text-sm">Time remaining: {timeRemaining} seconds</p>
              </div>
              {gameOver && (
                <div className="text-center mb-4 text-red-500 text-xl font-bold">Game Over!</div>
              )}
              {gameWon && (
                <div className="text-center mb-4 text-green-500 text-xl font-bold">
                  Congratulations! Season 1 finished!
                </div>
              )}
              <div className="flex justify-center gap-2 mb-4">
                <Button onClick={() => movePlayer(-1, 0)} disabled={gameOver || gameWon} className="text-sm px-2 py-1">
                  ⬅️
                </Button>
                <Button onClick={() => movePlayer(0, -1)} disabled={gameOver || gameWon} className="text-sm px-2 py-1">
                  ⬆️
                </Button>
                <Button onClick={() => movePlayer(0, 1)} disabled={gameOver || gameWon} className="text-sm px-2 py-1">
                  ⬇️
                </Button>
                <Button onClick={() => movePlayer(1, 0)} disabled={gameOver || gameWon} className="text-sm px-2 py-1">
                  ➡️
                </Button>
              </div>
              <div className="flex justify-center mb-4">
                <Button onClick={resetGame} className="text-lg">
                  {gameOver || gameWon ? '🔄 Play Again' : '🔄 Restart Game'}
                </Button>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
                <ul className="list-decimal list-inside">
                  {leaderboard.map((entry, index) => (
                    <li key={index} className="mb-1">
                      {entry.nickname}: XP {entry.score}, Tournament {entry.tournament}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}