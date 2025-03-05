"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import toast, { Toaster } from "react-hot-toast"

function MathGame() {
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      /* Chrome, Safari, Edge, Opera */
      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      /* Firefox */
      input[type=number] {
        -moz-appearance: textfield;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Game setup states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedOperations, setSelectedOperations] = useState<string[]>([])
  const [gameStarted, setGameStarted] = useState(false)

  // Game progress states
  const [mistakes, setMistakes] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentProblem, setCurrentProblem] = useState<{ question: string; answer: number } | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResults, setShowResults] = useState(false)

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // Input ref for focus
  const inputRef = useRef<HTMLInputElement>(null)

  const difficulties = [
    { name: "Easy", color: "bg-green-300" },
    { name: "Medium", color: "bg-yellow-300" },
    { name: "Hard", color: "bg-red-300" },
  ]

  const operations = ["Addition", "Subtraction", "Multiplication", "Division"]
  const allOperations = [...operations, "Mixed"]

  // Handle operation selection
  const handleOperationSelect = (operation: string) => {
    if (operation === "Mixed") {
      setSelectedOperations(["Mixed"])
      return
    }
    let newOperations = [...selectedOperations]

    if (newOperations.includes(operation)) {
      newOperations = newOperations.filter((op) => op !== operation)
    } else {
      if (newOperations.includes("Mixed")) {
        newOperations = newOperations.filter((op) => op !== "Mixed")
      }
      newOperations.push(operation)
    }

    // If all 4 basic operations are selected, replace with Mixed
    if (operations.every((op) => newOperations.includes(op))) {
      setSelectedOperations(["Mixed"])
    } else {
      setSelectedOperations(newOperations)
    }
  }

  // Generate a random number based on difficulty
  const generateNumber = (difficulty: string): number => {
    switch (difficulty) {
      case "Easy":
        return Math.floor(Math.random() * 10) + 1 // 1-10
      case "Medium":
        return Math.floor(Math.random() * 50) + 1 // 1-50
      case "Hard":
        return Math.floor(Math.random() * 100) + 1 // 1-100
      default:
        return Math.floor(Math.random() * 10) + 1
    }
  }

  // Generate a math problem based on difficulty and operations
  const generateProblem = () => {
    if (!selectedDifficulty) return null

    const operationsToUse = selectedOperations.includes("Mixed") ? operations : selectedOperations

    if (operationsToUse.length === 0) return null

    const operation = operationsToUse[Math.floor(Math.random() * operationsToUse.length)]
    let num1 = generateNumber(selectedDifficulty)
    let num2 = generateNumber(selectedDifficulty)

    // Ensure division problems have clean answers
    if (operation === "Division") {
      num2 = num2 === 0 ? 1 : num2
      const product = num1 * num2
      return {
        question: `${product} ÷ ${num2} = ?`,
        answer: num1,
      }
    }

    // For subtraction, ensure num1 >= num2 to avoid negative answers
    if (operation === "Subtraction" && num1 < num2) {
      ;[num1, num2] = [num2, num1]
    }

    let question = ""
    let answer = 0

    switch (operation) {
      case "Addition":
        question = `${num1} + ${num2} = ?`
        answer = num1 + num2
        break
      case "Subtraction":
        question = `${num1} - ${num2} = ?`
        answer = num1 - num2
        break
      case "Multiplication":
        question = `${num1} × ${num2} = ?`
        answer = num1 * num2
        break
    }

    return { question, answer }
  }

  // Start the game
  const startGame = () => {
    if (!selectedDifficulty || selectedOperations.length === 0) return

    setGameStarted(true)
    setMistakes(0)
    setScore(0)
    setTimeLeft(60)
    setCurrentProblem(generateProblem())

    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Focus on the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  // End the game
  const endGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setGameStarted(false)
    setShowResults(true)
  }

  // Reset game details
  const resetGame = () => {
    setTimeLeft(60)
    setMistakes(0)
    setScore(0)
    setCurrentProblem(null)
    setUserAnswer("")
    setSelectedDifficulty(null)
    setSelectedOperations([])
  }

  // Handle user answer submission
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentProblem) return

    const userNum = Number(userAnswer)

    if (userNum === currentProblem.answer) {
      // Correct answer
      setScore((prev) => prev + 1)
      toast.success("Correct!", { duration: 1500 })
    } else {
      // Wrong answer
      setMistakes((prev) => prev + 1)
      toast.error(`Wrong! The correct answer is ${currentProblem.answer}`, { duration: 2000 })
    }

    // Generate a new problem
    setCurrentProblem(generateProblem())
    setUserAnswer("")
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Get operations display text for results
  const getOperationsText = () => {
    if (selectedOperations.includes("Mixed")) {
      return "Mixed"
    }
    return selectedOperations.join(", ")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <header className="w-full flex justify-center p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold">Math Game</h1>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white shadow-[0_0_15px_rgba(255,255,255,0.7)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center border-2 justify-between border-gray-300 rounded-md p-4">
              <h2>Mistakes:</h2>
              <p>{mistakes}</p>
            </div>
            <div className="flex items-center border-2 justify-between border-gray-300 rounded-md p-4">
              <h2>Score:</h2>
              <p>{score}</p>
            </div>
            <div className="flex items-center border-2 justify-between border-gray-300 rounded-md p-4">
              <h2>Time:</h2>
              <p>{timeLeft}</p>
            </div>
          </div>

          {!gameStarted ? (
            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-4">Select difficulty:</h2>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                {difficulties.map(({ name, color }) => (
                  <Button
                    key={name}
                    variant="outline"
                    onClick={() => setSelectedDifficulty(name)}
                    className={`text-lg p-4 md:p-6 w-full md:w-[30%] transition-colors duration-500 cursor-pointer 
                      ${selectedDifficulty === name ? `${color} hover:${color}` : "bg-white hover:bg-gray-200"}`}
                  >
                    {name}
                  </Button>
                ))}
              </div>

              <h2 className="text-lg md:text-2xl font-bold mb-4">Select operations:</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {allOperations.map((operation) => (
                  <Button
                    key={operation}
                    variant="outline"
                    onClick={() => handleOperationSelect(operation)}
                    className={`text-sm md:text-lg p-4 md:p-6 transition-colors duration-500 cursor-pointer 
                      ${selectedOperations.includes(operation) ? "bg-blue-300 hover:bg-blue-300" : "bg-white hover:bg-gray-200"}`}
                  >
                    {operation}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mb-6">
              {currentProblem && (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">{currentProblem.question}</h2>
                  <form onSubmit={handleAnswerSubmit} className="w-full max-w-md">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Input
                        ref={inputRef}
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        className="text-xl p-4 md:p-6 flex-grow"
                        autoFocus
                      />
                      <Button type="submit" className="bg-green-500 hover:bg-green-400 text-white text-lg p-4 md:p-6">
                        Submit
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          <div className="flex justify-center md:justify-end">
            {!gameStarted ? (
              <Button
                onClick={startGame}
                disabled={!selectedDifficulty || selectedOperations.length === 0}
                className="bg-blue-500 hover:bg-blue-400 hover:text-black text-white text-lg p-4 md:p-6 transition-colors duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game
              </Button>
            ) : (
              <Button
                onClick={endGame}
                className="bg-red-500 hover:bg-red-400 hover:text-black text-white text-lg p-4 md:p-6 transition-colors duration-500 cursor-pointer"
              >
                End Game
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Results Dialog */}
      <AlertDialog
        open={showResults}
        onOpenChange={(open) => {
          setShowResults(open)
          if (!open) {
            resetGame()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Results</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-base">
                <p>
                  <strong>Difficulty:</strong> {selectedDifficulty}
                </p>
                <p>
                  <strong>Operations:</strong> {getOperationsText()}
                </p>
                <p>
                  <strong>Score:</strong> {score}
                </p>
                <p>
                  <strong>Mistakes:</strong> {mistakes}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default MathGame