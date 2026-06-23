import { exec } from 'child_process'
import open from 'open'

exec('vite --host 0.0.0.0 --port 3000', (err) => {
  if (err) {
    console.error('Error al iniciar Vite:', err)
    return
  }
  open('http://localhost:3000')
}) 