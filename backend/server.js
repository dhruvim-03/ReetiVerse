import express from 'express'
import cors from 'cors'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const DATA_PATH = path.join(__dirname, 'data', 'statesData.json')

async function getStatesData() {
  const content = await fs.readFile(DATA_PATH, 'utf-8')
  return JSON.parse(content)
}

// Get all states (summary list)
app.get('/api/states', async (req, res) => {
  try {
    const data = await getStatesData()
    const summary = Object.keys(data).map(id => ({
      id,
      name: data[id].name,
      description: data[id].description
    }))
    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read states data' })
  }
})

// Get details for a specific state
app.get('/api/states/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params
    const data = await getStatesData()
    const state = data[stateId.toLowerCase()]
    if (!state) {
      return res.status(404).json({ error: 'State not found' })
    }
    res.json(state)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read state data' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 ReetiVerse Backend running at http://localhost:${PORT}`)
})
