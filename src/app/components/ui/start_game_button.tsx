'use client'

import { useState } from 'react'

import { Button } from '../../../components/ui/index';

import { CheckCircle2, XCircle } from 'lucide-react'

export function GameStart() {
  const [gameCode, setGameCode] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gameCode.trim() === '') {
      setMessage({ type: 'error', text: 'Please enter a game code' })
    } else {
      // Here you would typically make an API call to join the game
      // For this example, we'll just simulate a successful join
      setMessage({ type: 'success', text: 'Successfully joined the game!' })
      // Reset the input after successful submission
      setGameCode('')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Start a Game</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p id="gameCodeHelp" className="mt-1 text-sm text-gray-500">
            Start a new game, share the link with friends
          </p>
        </div>
        <Button type="submit" className="w-full">
          Start Game
        </Button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="flex items-center text-sm">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
            )}
            {message.text}
          </p>
        </div>
      )}
    </div>
  )
}