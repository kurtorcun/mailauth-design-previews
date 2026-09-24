const models = {
  deck: 'Katmanlı dönüş',
  rail: 'Yatay akış',
  side: 'Yan sahne',
}

const requestedModel = new URLSearchParams(window.location.search).get('model')
const model = Object.hasOwn(models, requestedModel) ? requestedModel : 'deck'
const preview = document.querySelector('#preview')
const scene = document.querySelector('#scene')
const dots = document.querySelector('#dots')
let active = 0
let timer

preview.dataset.model = model
document.querySelector('#model-name').textContent = models[model]
document.querySelectorAll('[data-model-link]').forEach((link) => {
  if (link.dataset.modelLink === model) link.setAttribute('aria-current', 'page')
})

const cards = [
  {
    letter: 'H',
    title: 'E-posta header analizi',
    short: 'Header',
    status: 'Doğrulandı',
    compact: 'SPF · DKIM · DMARC',
    href: 'https://mailauth.app/app',
    cta: 'Tüm sonucu aç',
    body: `<dl class="result-grid">
      <dt>From</dt><dd>notice@example.com</dd>
      <dt>SPF</dt><dd class="ok">pass</dd>
      <dt>DKIM</dt><dd class="ok">pass</dd>
      <dt>DMARC</dt><dd class="ok">pass (p=quarantine)</dd>
      <dt>Received</dt><dd>from mail-101.example.net</dd>
    </dl>`,
  },
  {
    letter: 'D',
    title: 'Alan adı durumu',
    short: 'Alan adı',
    status: 'Sağlıklı',
    compact: '6 DNS kaydı',
    href: 'https://mailauth.app/tr/domain',
    cta: 'Alan adı analizini aç',
    body: `<div class="domain-grid">
      <span>SPF</span><span>✓ Görüldü</span>
      <span>DKIM</span><span>✓ Görüldü</span>
      <span>DMARC</span><span>✓ Görüldü</span>
      <span>MX</span><span>✓ Görüldü</span>
      <span>DNSSEC</span><span>✓ Görüldü</span>
      <span>MTA-STS</span><span>✓ Görüldü</span>
    </div>`,
  },
  {
    letter: 'S',
    title: 'SMTP yanıtı',
    short: 'SMTP',
    status: 'Reddedildi',
    compact: '550 5.7.515',
    href: 'https://mailauth.app/tr/smtp',
    cta: 'Ret nedenini incele',
    body: `<strong class="smtp-code">550 5.7.515</strong>
      <p class="smtp-copy">Sender not authenticated; message rejected.</p>`,
  },
]

const cardElements = cards.map((item, index) => {
  const card = document.createElement('a')
  card.className = 'card'
  card.href = item.href
  card.setAttribute('aria-label', `${item.title}: ${item.cta}`)
  card.innerHTML = `<div class="card-header">
    <span class="card-icon" aria-hidden="true">${item.letter}</span>
    <span class="card-title"><span class="card-title-long">${item.title}</span><span class="card-title-short">${item.short}</span></span>
    <span class="badge ${index === 2 ? 'bad' : ''}">${item.status}</span>
  </div>
  <div class="card-detail">${item.body}</div>
  <span class="card-compact">${item.compact}</span>
  <span class="card-cta">${item.cta} →</span>`
  card.addEventListener('click', (event) => {
    if (active !== index) {
      event.preventDefault()
      setActive(index)
    }
  })
  scene.appendChild(card)
  return card
})

const dotElements = cards.map((item, index) => {
  const dot = document.createElement('button')
  dot.className = 'dot'
  dot.type = 'button'
  dot.setAttribute('aria-label', `${item.short} örneğini göster`)
  dot.addEventListener('click', () => setActive(index))
  dots.appendChild(dot)
  return dot
})

function setActive(index) {
  active = (index + cards.length) % cards.length
  cardElements.forEach((card, cardIndex) => {
    const position = (cardIndex - active + cards.length) % cards.length
    card.className = `card ${['featured', 'next', 'previous'][position]}`
  })
  dotElements.forEach((dot, dotIndex) => dot.setAttribute('aria-pressed', String(dotIndex === active)))
}

function stopTimer() {
  window.clearInterval(timer)
  timer = undefined
}

function startTimer() {
  stopTimer()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (preview.matches(':hover') || preview.contains(document.activeElement)) return
  timer = window.setInterval(() => setActive(active + 1), 4500)
}

document.querySelector('#previous').addEventListener('click', () => setActive(active - 1))
document.querySelector('#next').addEventListener('click', () => setActive(active + 1))
preview.addEventListener('mouseenter', stopTimer)
preview.addEventListener('mouseleave', startTimer)
preview.addEventListener('focusin', stopTimer)
preview.addEventListener('focusout', () => window.setTimeout(startTimer, 0))
document.addEventListener('visibilitychange', () => document.hidden ? stopTimer() : startTimer())

setActive(0)
startTimer()
