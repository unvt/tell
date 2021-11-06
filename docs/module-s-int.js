import {
  YAML
//} from "./YAML.js"
} from "https://unvt.github.io/tell/YAML.js" //used absolute path so that html can work from file system

const style = href => {
  const e = document.createElement('link')
  e.href = href
  e.rel = 'stylesheet'
  document.head.appendChild(e)
}

const script = src => {
  const e = document.createElement('script')
  e.src = src
  document.head.appendChild(e)
}

const init = () => {
 style("https://unvt.github.io/tell/style.css") //used absolute path so that html can work from file system
 style("https://unvt.github.io/tell/maplibre-gl.css") //used absolute path so that html can work from file system
 script("https://unvt.github.io/tell/maplibre-gl.js") //used absolute path so that html can work from file system
 script("https://unvt.github.io/tell/intersection-observer.js") //used absolute path so that html can work from file system
 script("https://unvt.github.io/tell/scrollama.js") //used absolute path so that html can work from file system
/*
  for(let url of [
'style.css',
'maplibre-gl.css'
  ]) {
    style(url)
  }
  for(let url of [
'maplibre-gl.js',
'intersection-observer.js',
'scrollama.js'
  ]) {
    script(url)
  }
*/

  for(let id of ['map', 'story']) {
    const el = document.createElement('div')
    el.id = id
    document.body.appendChild(el)
  }
}
init()

let mapgl
let config
let map

const alignments = {
  'left': 'lefty',
  'center': 'centered',
  'right': 'righty',
  'full': 'fully'
}

const chapterView = chapter => {
  return config.view[chapter.location]
}

const center = (config, i) => {
  return config.view[config.chapters[i].location].center
}

const zoom = (config, i) => {
  return config.view[config.chapters[i].location].zoom
}

const tell = () => {
  map = new mapgl.Map({
    container: 'map',
    style: config.style,
    center: center(config, 0),
    zoom: zoom(config, 0),
    interactive: true
  })
  let story = document.getElementById('story')
  let features = document.createElement('div')
  features.setAttribute('id', 'features')
  let header = document.createElement('div')

  if (config.title) {
    let t = document.createElement('h1')
    t.innerText = config.title
    header.appendChild(t)
  }

  if (config.subtitle) {
    let t = document.createElement('h2')
    t.innerText = config.subtitle
    header.appendChild(t)
  }

  if (config.byline) {
    let t = document.createElement('p')
    t.innerText = config.byline
    header.appendChild(t)
  }

  if (header.innerText.length > 0) {
    header.classList.add(config.theme)
    header.setAttribute('id', 'header')
    story.appendChild(header)
  }

  config.chapters.forEach((record, idx) => {
    let container = document.createElement('div')
    let chapter = document.createElement('div')

    if (record.title) {
      let e = document.createElement('h3')
      e.innerHTML = '<a target="' + record.id + 
        '" href="' + record.url + '">' + record.title + '</a>'
      chapter.appendChild(e)
    }

    if (record.image) {
      let e = new Image()
      e.src = record.image
      chapter.appendChild(e)
    }

    if (record.description) {
      let e = document.createElement('p')
      e.innerHTML = record.description
      chapter.appendChild(e)
    }

    container.setAttribute('id', record.id)
    container.classList.add('step')
    if (idx === 0) container.classList.add('active')

    chapter.classList.add(config.theme)
    container.appendChild(chapter)
    container.classList.add(alignments[record.alignment] || 'centered')
    if (record.hidden) container.classList.add('hidden')
    features.appendChild(container)
  })

  story.appendChild(features)

  let footer = document.createElement('div')

  if (config.footer) {
    let e = document.createElement('p')
    e.innerHTML = config.footer
    footer.appendChild(e)
  }

  if (footer.innerText.length > 0) {
    footer.classList.add(config.theme)
    footer.setAttribute('id', 'footer')
    story.appendChild(footer)
  }

  let scroller = scrollama()

  map.on('load', () => {
    scroller
    .setup({
      step: '.step',
      offset: 0.5,
      progress: true
    })
    .onStepEnter(response => {
      let chapter = config.chapters.find(chap => chap.id === response.element.id)
      response.element.classList.add('active')
      map[chapter.mapAnimation || 'flyTo'](chapterView(chapter))
console.log(map.flyTo)
console.log(map.flyTo(chapterView(chapter)))
    })
    .onStepExit(response => {
      let chapter = config.chapters.find(chap => chap.id === response.element.id)
      response.element.classList.remove('active')
    })
  })

  window.addEventListener('resize', scroller.resize)
}

/*
const showMap = async () => {
  mapgl = maplibregl
  let url = document.location.search.substring(1)
  url = url ? url : './story.yml'
  YAML.load(url, c => {
    config = c
    console.log(config)
    tell()
  })
}
*/

//2021-10-28 (from here)  YAML in html files is read first

const process = async (config) => {
  return new Promise(async (resolve) => {
    config.theme = 'light'
    config.showMarkers = false
    const urlParams = new URLSearchParams(window.location.search)
    if (config.allowExternalStory && urlParams.has('story')) {
      config.chapters = window.location.search.split('story=')[1]
      // specify map title
      if (urlParams.has('title')) {
        config.title = urlParams.get('title')
      }
      // specify default zoom level
      if (urlParams.has('zoom')) {
        config.defaultZoom = parseInt(urlParams.get('zoom'))
      }
    }
    config.chapters = createChapters(config.chapters, config.defaultZoom || 10)
    resolve(config)
  })
}


const getYAML = () => {
  const sc = document.querySelectorAll("script");
  for (const s of sc) {
    if (s.type == "text/yaml") {
      return s.textContent;
    }
  }
  return null;
};


const showMap = async () => {
  mapgl = maplibregl

  const yml = getYAML()
  if (!yml) {
    let url = document.location.search.substring(1)
    url = url ? url : './story.yml'
    YAML.load(url, c => {
      config = c
      console.log(config)
      tell()
//    alert(config)
    })
  } else {
    //alert("found YAML")
    //alert(yml)
    config =  YAML.parse(yml)
    //alert(config)
    console.log(config)
    tell()
  }
}

//2021-10-28 (until here)


window.onload = showMap