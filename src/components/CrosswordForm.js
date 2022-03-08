import React, { useState, useRef, useEffect } from 'react'
import { generateLayout } from '../lib/Crossword-Layout-Generator/layout_generator'
import Crossword from 'react-crossword'
import { mungeLocalCrossword } from '../utils'
import { ThemeProvider } from 'styled-components'
import { addNewPuzzle } from '../add-puzzle'

const CrosswordForm = () => {
  const blankClue = { clue: "", answer: "" }
  const [clueAnswerArray, setClueAnswerArray] = useState([blankClue])
  const [dimensions, setDimensions] = useState()
  const [generatedLayout, setGeneratedLayout] = useState()
  const [crosswordLayout, setCrosswordLayout] = useState()
  const [prizeDeposit, setPrizeDeposit] = useState('10')
  const crosswordRef = useRef(null)

  const handleClueAnswerChange = (e, key, propName) => {
    const updatedArray = [...clueAnswerArray]
    updatedArray[key][propName] = e.target.value
    setClueAnswerArray(updatedArray)
  }

  const handlePrizeDepositChange = (e) => {
    setPrizeDeposit(e.target.value)
  }

  const generateSamplePuzzle = () => {
    const filteredClueAnswers =  JSON.parse(JSON.stringify(clueAnswerArray.filter(ca => ca.answer.length > 2)))
    if (filteredClueAnswers.length >= 3 ) {
      const layout = generateLayout(filteredClueAnswers)
      const answers = []
      layout.result.map(value => {
        const answerObj = {
          'num': value.position,
          'start': {
            'x': value.startx,
            'y': value.starty
          },
          'direction': value.orientation,
          'length': value.answer.length,
          'answer': value.answer,
          'clue': value.clue
        }
        if (answerObj.num) {
          answers.push(answerObj)
        }
      })
      setDimensions({
        x: layout.cols,
        y: layout.rows
      })
      setGeneratedLayout(answers)
      setCrosswordLayout(mungeLocalCrossword(answers))
    }
  }

  useEffect(() => {
    if (crosswordRef.current) {
      crosswordRef.current.fillAllAnswers()
      return () => {
        crosswordRef.current.reset()
      }
    }
  }, [crosswordLayout])

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>

        {
          clueAnswerArray.map((value, key) => {
            return (
              <div className="clue-answer-item" key={key}>
                <input
                  type="text"
                  onChange={(e) => handleClueAnswerChange(e, key, 'clue')}
                  name={`clue-${key}`}
                  value={value.clue}
                  placeholder="Some clue here"
                />
                <input
                  type="text"
                  onChange={(e) => handleClueAnswerChange(e, key, 'answer')}
                  name={`answer-${key}`}
                  value={value.answer}
                  placeholder="The clue's solution"
                />
              </div>
            )
          })
        }

        <button
          className="add-clue-answer-item"
          onClick={() => setClueAnswerArray([...clueAnswerArray, blankClue])}
        >+ Add</button>

        <button
          className="generate-sample-crossword"
          onClick={() => generateSamplePuzzle()}
        >Generate Sample Crossword</button>

        { crosswordLayout && generatedLayout && dimensions &&
          <button
            className="add-puzzle"
            onClick={() => addNewPuzzle(crosswordLayout, generatedLayout, dimensions, prizeDeposit)}
          >Add Puzzle to Contract</button>
        }

        <br />

        <input
          type="number"
          defaultValue={prizeDeposit}
          onChange={(e) => handlePrizeDepositChange(e)}
        />

      </form>
      { crosswordLayout && 
        <ThemeProvider
          theme={{
            columnBreakpoint   : '9999px',
            gridBackground     : '#fff',
            cellBackground     : '#D5D5D5',
            cellBorder         : '#D5D5D5',
            textColor          : '#000000',
            numberColor        : '#000000',
            focusBackground    : 'rgba(170, 208, 85, 0.5)',
            highlightBackground: 'rgba(255, 200, 96, 0.5)',
          }}
        >
          <Crossword ref={crosswordRef} data={crosswordLayout} useStorage={false} />
        </ThemeProvider>
      }
      
    </div>
  )
}

export default CrosswordForm
