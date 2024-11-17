'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

// ... (keep all the constants as they are)

type Position = { x: number; y: number }

type LeaderboardEntry = {
  nickname: string;
  score: number;
  tournament: number;
}

export default function Game() {
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

  const updateLeaderboard = useCallback(() => {
    setLeaderboard(prev => {
      const newEntry = { nickname, score, tournament }
      return [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    })
  }, [nickname, score, tournament])

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
    const randomFoodImages = INITIAL_FOOD.map(() => 
      PIGGY_IMAGES[Math.floor(Math.random() * PIGGY_IMAGES.length)]
    )
    setFoodImages(randomFoodImages)
  }, [gameWon, gameOver, updateLeaderboard])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  const addRandomPig = useCallback(() => {
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

    addRandomPig()
  }, [gameOver, gameWon, enemies, food, addRandomPig, updateLeaderboard])

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
  }, [gameStarted, gameOver, gameWon, updateLeaderboard])

  const getEnemyImage = useMemo(() => (level: number) => {
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
