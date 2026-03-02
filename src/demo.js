// import CWG from '../dist/crossword-generator.min'
import { g } from 'gelerator'
import CWG from './App'
import './demo.css'

const $ = s => document.getElementById(s)

const gen = () => {
  const words = $('key').value.split('\n').map(i => i.trim())
  const answers = $('val').value.split('\n').map(i => i.trim())

  if ($('ctnr')) {
    document.body.removeChild($('ctnr'))
    document.body.removeChild($('hint'))
  }
  const result = CWG(words)

  if (!result) {
    alert('Failed to generate crossword. Words may not share enough characters.')
    return
  }

  const ctnr = g({
    id: 'ctnr',
    style: {
      height: 30 * result.height + 4 + 'px',
      width: 30 * result.width + 4 + 'px'
    }
  })()
  const hint = g({id: 'hint'})()
  document.body.appendChild(ctnr)
  document.body.appendChild(hint)

  let count = 0
  result.ownerMap.forEach((line, y) => {
    line.forEach((obj, x) => {
      ctnr.appendChild(g({
        id: x + '' + y,
        $letter: obj.letter,
        $v: obj.v,
        $h: obj.h,
        $x: '' + x,
        $y: '' + y,
        $vidx: obj.vIdx,
        $hidx: obj.hIdx,
        maxlength: 1,
        autocomplete: 'disabled',
        style: {
          left: 30 * x + 'px',
          top: 30 * y + 'px'
        }
      }, 'input')())
      count += 1
    })
  })

  let doinVertically = null
  ctnr.addEventListener('focus', e => {
    const el = e.target
    const h = el.dataset.h
    const v = el.dataset.v
    hint.innerHTML = (h ? 'horizion：' + answers[h] : '') + (v ? '<br>vertical：' + answers[v] : '<br>')
  }, true)

  ctnr.addEventListener('click', e => {
    const el = e.target
    if (el.nodeName !== 'INPUT') return hint.innerHTML = ''
    const x = + el.dataset.x
    const y = + el.dataset.y
    if ($(`${x}${y + 1}`)) doinVertically = true
    else if ($(`${x + 1}${y}`)) doinVertically = false
    else doinVertically = null
  })

  ctnr.addEventListener('input', e => {
    const el = e.target
    const x = + el.dataset.x
    const y = + el.dataset.y
    if (e.data === el.dataset.letter) count -= 1
    if (count === 0) setTimeout(() => alert('YOU WIN!'), 4)
    const findNextEl = (x, y, v) => {
      const rtnEl = $(`${x + !v}${y + v}`)
      if (!rtnEl) return el.blur()
      if (rtnEl.value) return findNextEl(x + !v, y + v, v)
      return rtnEl
    }
    const nextEl = findNextEl(x, y, doinVertically)
    if (nextEl) nextEl.focus()
  })

}

$('gen').onclick = gen

$('toggle').onclick = () => {
  const ctnr = $('ctnr')
  if (!ctnr) return
  const inputs = ctnr.querySelectorAll('input')
  inputs.forEach(input => {
    if (input.value === input.dataset.letter) {
      input.value = ''
    } else {
      input.value = input.dataset.letter
    }
  })
}
