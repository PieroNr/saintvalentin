import './style.css'

const photos = [
  '/img/IMG%202725.webp',
  '/img/IMG%203021.webp',
  '/img/IMG%203078.webp',
  '/img/IMG%203251.webp',
  '/img/IMG%203311.webp',
  '/img/IMG%203336.webp',
  '/img/IMG%203347.webp',
  '/img/IMG%203357.webp',
  '/img/IMG%203492.webp',
  '/img/IMG%203667.webp',
  '/img/IMG%203764.webp',
  '/img/IMG%203951.webp'
]

const ROTATE_MS = 450
const MAX_OFFSET_PX = 20
const MIN_OFFSET_DELTA_PX = 6
const YES_GIF_SRC = '/img/oui.gif'
const NO_GIF_SRC = '/img/non.gif'

const preloadImages = (sources: string[]) => {
  sources.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

preloadImages([YES_GIF_SRC, NO_GIF_SRC])

const app = document.querySelector<HTMLDivElement>('#app')!
let cleanupFns: Array<() => void> = []

const onCleanup = (fn: () => void) => {
  cleanupFns.push(fn)
}

const cleanupAll = () => {
  cleanupFns.forEach((fn) => fn())
  cleanupFns = []
}

const setupSlideshow = (photoEl: HTMLImageElement) => {
  let index = 0
  let lastOffsetX = 0
  let lastOffsetY = 0

  const applyRandomOffset = () => {
    let offsetX = 0
    let offsetY = 0
    let attempts = 0

    do {
      offsetX = Math.round((Math.random() * 2 - 1) * MAX_OFFSET_PX)
      offsetY = Math.round((Math.random() * 2 - 1) * MAX_OFFSET_PX)
      attempts += 1
    } while (
      attempts < 6 &&
      Math.abs(offsetX - lastOffsetX) < MIN_OFFSET_DELTA_PX &&
      Math.abs(offsetY - lastOffsetY) < MIN_OFFSET_DELTA_PX
    )

    lastOffsetX = offsetX
    lastOffsetY = offsetY
    photoEl.style.setProperty('--photo-offset-x', `${offsetX}px`)
    photoEl.style.setProperty('--photo-offset-y', `${offsetY}px`)
  }

  const rotate = () => {
    index = (index + 1) % photos.length
    photoEl.src = photos[index]
    applyRandomOffset()
  }

  applyRandomOffset()
  const intervalId = window.setInterval(rotate, ROTATE_MS)
  onCleanup(() => window.clearInterval(intervalId))
}

const setupNoButtonAvoidance = (noButton: HTMLButtonElement) => {
  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches
  const supportsCoarsePointer = window.matchMedia('(pointer: coarse)').matches

  if (supportsFinePointer) {
    const SAFE_DISTANCE_PX = 180
    const MAX_ESCAPE_PX = 220
    const LERP_SPEED = 0.14
    const VIEWPORT_PADDING_PX = 12

    let currentOffsetX = 0
    let currentOffsetY = 0
    let mouseX = 0
    let mouseY = 0
    let hasMouse = false
    let originRect = noButton.getBoundingClientRect()
    let rafId = 0

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max)

    const updateOrigin = () => {
      originRect = noButton.getBoundingClientRect()
    }

    const onMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      hasMouse = true
    }

    const animate = () => {
      const originCenterX = originRect.left + originRect.width / 2
      const originCenterY = originRect.top + originRect.height / 2

      let targetX = 0
      let targetY = 0

      if (hasMouse) {
        const deltaX = originCenterX - mouseX
        const deltaY = originCenterY - mouseY
        const distance = Math.hypot(deltaX, deltaY)

        if (distance > 0 && distance < SAFE_DISTANCE_PX) {
          const normalizedX = deltaX / distance
          const normalizedY = deltaY / distance
          const force = 1 - distance / SAFE_DISTANCE_PX
          const repel = MAX_ESCAPE_PX * force
          targetX = normalizedX * repel
          targetY = normalizedY * repel
        }
      }

      const minOffsetX = VIEWPORT_PADDING_PX - originRect.left
      const maxOffsetX =
        window.innerWidth -
        VIEWPORT_PADDING_PX -
        (originRect.left + originRect.width)
      const minOffsetY = VIEWPORT_PADDING_PX - originRect.top
      const maxOffsetY =
        window.innerHeight -
        VIEWPORT_PADDING_PX -
        (originRect.top + originRect.height)

      targetX = clamp(targetX, minOffsetX, maxOffsetX)
      targetY = clamp(targetY, minOffsetY, maxOffsetY)

      currentOffsetX += (targetX - currentOffsetX) * LERP_SPEED
      currentOffsetY += (targetY - currentOffsetY) * LERP_SPEED

      noButton.style.setProperty('--no-offset-x', `${Math.round(currentOffsetX)}px`)
      noButton.style.setProperty('--no-offset-y', `${Math.round(currentOffsetY)}px`)

      rafId = window.requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', updateOrigin)
    rafId = window.requestAnimationFrame(animate)

    onCleanup(() => {
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', updateOrigin)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    })
  }

  if (supportsCoarsePointer) {
    const VIEWPORT_PADDING_PX = 12
    let baseRect = noButton.getBoundingClientRect()

    const updateBaseRect = () => {
      noButton.style.setProperty('--no-offset-x', '0px')
      noButton.style.setProperty('--no-offset-y', '0px')
      baseRect = noButton.getBoundingClientRect()
    }

    const moveToRandomSpot = () => {
      const maxLeft = Math.max(
        VIEWPORT_PADDING_PX,
        window.innerWidth - VIEWPORT_PADDING_PX - baseRect.width
      )
      const maxTop = Math.max(
        VIEWPORT_PADDING_PX,
        window.innerHeight - VIEWPORT_PADDING_PX - baseRect.height
      )

      const targetLeft =
        VIEWPORT_PADDING_PX + Math.random() * (maxLeft - VIEWPORT_PADDING_PX)
      const targetTop =
        VIEWPORT_PADDING_PX + Math.random() * (maxTop - VIEWPORT_PADDING_PX)

      const offsetX = targetLeft - baseRect.left
      const offsetY = targetTop - baseRect.top

      noButton.style.setProperty('--no-offset-x', `${Math.round(offsetX)}px`)
      noButton.style.setProperty('--no-offset-y', `${Math.round(offsetY)}px`)
    }

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault()
      event.stopPropagation()
      moveToRandomSpot()
    }

    noButton.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', updateBaseRect)

    onCleanup(() => {
      noButton.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', updateBaseRect)
    })
  }
}

const renderHome = () => {
  app.innerHTML = `
    <main class="valentine">
      <div class="valentine-photo-frame">
        <img class="valentine-photo" src="${photos[0]}" alt="Diaporama de souvenirs" />
      </div>
      <h1 class="valentine-title">Veux-tu être ma valentiiineeannnnnh ?</h1>
      <div class="valentine-actions">
        <button class="btn btn-yes" type="button">Oui</button>
        <button class="btn btn-no" type="button">Non</button>
      </div>
    </main>
  `

  const photoEl = app.querySelector<HTMLImageElement>('.valentine-photo')
  if (photoEl) {
    setupSlideshow(photoEl)
  }

  const yesButton = app.querySelector<HTMLButtonElement>('.btn-yes')
  if (yesButton) {
    const onYesClick = () => {
      window.location.hash = 'oui'
    }
    yesButton.addEventListener('click', onYesClick)
    onCleanup(() => yesButton.removeEventListener('click', onYesClick))
  }

  const noButton = app.querySelector<HTMLButtonElement>('.btn-no')
  if (noButton) {
    const onNoClick = () => {
      window.location.hash = 'non'
    }
    noButton.addEventListener('click', onNoClick)
    onCleanup(() => noButton.removeEventListener('click', onNoClick))

    setupNoButtonAvoidance(noButton)
  }
}

const renderYes = () => {
  app.innerHTML = `
    <main class="valentine valentine-screen">
      <img class="valentine-gif" src="${YES_GIF_SRC}" alt="Oui" loading="eager" decoding="async" />
      <h1 class="valentine-title">Merci JTMMMM &lt;3</h1>
    </main>
  `
}

const renderNo = () => {
  app.innerHTML = `
    <main class="valentine valentine-screen">
      <img class="valentine-gif" src="${NO_GIF_SRC}" alt="Non" loading="eager" decoding="async" />
      <div class="valentine-icon">&times;</div>
      <h1 class="valentine-title">Je refuse ton non, respire et réessaies</h1>
      <p class="valentine-countdown">Retour dans <span data-countdown>5</span>s</p>
    </main>
  `

  const countdownEl = app.querySelector<HTMLSpanElement>('[data-countdown]')
  let remaining = 5

  const updateCountdown = () => {
    if (countdownEl) {
      countdownEl.textContent = String(remaining)
    }
  }

  updateCountdown()

  const intervalId = window.setInterval(() => {
    remaining -= 1
    if (remaining <= 0) {
      window.clearInterval(intervalId)
      window.location.hash = ''
      return
    }
    updateCountdown()
  }, 1000)

  onCleanup(() => window.clearInterval(intervalId))
}

const renderRoute = () => {
  cleanupAll()
  const route = window.location.hash.replace('#', '')

  if (route === 'oui') {
    renderYes()
    return
  }

  if (route === 'non') {
    renderNo()
    return
  }

  renderHome()
}

window.addEventListener('hashchange', renderRoute)
renderRoute()
