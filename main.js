var regl = require('regl')({
  extensions: ['oes_standard_derivatives']
})
var camera = require('regl-camera')(regl, {
  distance: 4, theta: -Math.PI/2, phi: 0.2,
  center: [+0.0,+0.0,+0.0]
})
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var tmpm = new Float32Array(16)
var tmpv = new Float32Array(3)

var papers = {
  l0: {
    positions: [-0.5,-0.5,+0.5,-0.5,+0.5,+0.5,-0.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [0.0,0.0,0.0],
    color: [0,0,0]
  },
  l1: {
    parent: 'l0',
    positions: [+0.5,-0.5,+1.5,-0.5,+1.5,+0.5,+0.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [0.5,0.5,0.0],
    color: [0,0,1]
  },
  l2: {
    parent: 'l1',
    positions: [+1.5,-0.5,+2.5,-0.5,+2.5,+0.5,+1.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [1.5,0.5,0.0],
    color: [0,1,0]
  },
  l3: {
    parent: 'l2',
    positions: [+2.5,-0.5,+3.5,-0.5,+3.5,+0.5,+2.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [2.5,0.5,0.0],
    color: [0,1,1]
  },
  u0: {
    parent: 'l0',
    positions: [-0.5,+0.5,+0.5,+0.5,+0.5,+1.5,-0.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+0.0,+0.5,0.0],
    color: [1,0,0]
  },
  u1: {
    parent: 'u0',
    positions: [+0.5,+0.5,+1.5,+0.5,+1.5,+1.5,+0.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+0.5,+0.5,0.0],
    color: [1,0,1]
  },
  u2: {
    parent: 'u1',
    positions: [+1.5,+0.5,+2.5,+0.5,+2.5,+1.5,+1.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+1.5,+0.5,0.0],
    color: [1,1,0]
  },
  u3: {
    parent: 'u2',
    positions: [+2.5,+0.5,+3.5,+0.5,+3.5,+1.5,+2.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+2.5,+0.5,0.0],
    color: [1,1,1]
  }
}
var paperProps = Object.values(papers)
var pose = {}
Object.keys(papers).forEach(function (key) {
  pose[key] = papers[key].pose
  papers[key].offset = [0,0,0]
})

var ease = require('eases')
var PI = Math.PI
var tm = require('./tm.js')({
  page0Flip: {
    state: { x: PI, y: PI, page: 0, offset: [0,0.35,-1.5], flip: PI },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  page0: {
    state: { x: PI, y: PI, page: 0, offset: [+0.0,0.35,-1.5], flip: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  page1: {
    state: { x: PI, y: PI, page: 1, offset: [-0.5,0.35,-1.5], flip: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  page2: {
    state: { x: PI, y: PI, page: 2, offset: [-0.5,0.35,-1.5], flip: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  page3: {
    state: { x: PI, y: PI, page: 3, offset: [0,0.35,-1.5], flip: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  page3Flip: {
    state: { x: PI, y: PI, page: 3, offset: [0,0.35,-1.5], flip: -PI },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  fold0: {
    state: { x: PI, y: 0, page: 0, offset: [0,0,0], flip: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut }
  },
  fold1: {
    state: { x: 0.1, y: 0, page: 0, offset: [-1.5,-0.25,0], flip: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut }
  }
})

var draw = {
  paper: paper(regl)
}
var speed = 0.35
var state = { page: 0, folded: true }
tm.go([ 'page0' ])
frame()

window.addEventListener('mousedown', frame)
window.addEventListener('mouseup', frame)
window.addEventListener('mousemove', frame)
window.addEventListener('wheel', frame)

window.addEventListener('keydown', function (ev) {
  if (ev.key === 'ArrowRight') {
    if (!state.folded && state.page === 3) {
      tm.go([
        'fold1',
        speed,
        'fold0',
        speed,
        'page3',
        speed,
        'page3Flip'
      ])
      state.folded = true
    } else if (!state.folded) {
      tm.go([
        'fold1',
        speed,
        'fold0',
        speed,
        'page' + state.page,
        speed,
        'page' + String((state.page+1)%4)
      ])
      state.folded = true
    } else if (state.page === 3) {
      tm.go([ 'page3', speed, 'page3Flip' ])
    } else {
      tm.go([
        'page' + state.page,
        speed,
        'page' + String((state.page+1)%4)
      ])
    }
    state.page = (state.page+1)%4
    frame()
  } else if (ev.key === 'ArrowLeft') {
    if (!state.folded && state.page === 0) {
      tm.go([
        'fold1',
        speed,
        'fold0',
        speed,
        'page0',
        speed,
        'page0Flip'
      ])
      state.folded = true
    } else if (!state.folded) {
      tm.go([
        'fold1',
        speed,
        'fold0',
        speed,
        'page' + state.page,
        speed,
        'page' + String((state.page+3)%4)
      ])
      state.folded = true
    } else if (state.page === 0) {
      tm.go([ 'page0', speed, 'page0Flip' ])
    } else {
      tm.go([
        'page' + state.page,
        speed,
        'page' + String((state.page+3)%4)
      ])
    }
    state.page = (state.page+3)%4
    frame()
  } else if (ev.key === ' ' && state.folded) {
    tm.go([ 'page' + state.page, 0.5, 'fold0', 0.5, 'fold1' ])
    state.folded = false
    frame()
  } else if (ev.key === ' ' && !state.folded) {
    tm.go([ 'fold1', 0.5, 'fold0', 0.5, 'page' + state.page ])
    state.folded = true
    state.page = 0
    frame()
  }
})

window.addEventListener('resize', frame)

function frame () {
  regl.poll()
  update(performance.now()/1000)
  updateModels()
  regl.clear({ color: [0.2,0.0,0.2,1], depth: true })
  camera(function () {
    draw.paper(paperProps)
  })
  if (!tm.stopped) window.requestAnimationFrame(frame)
}


function update (t) {
  paperProps.forEach(function (paper) {
    mat4.identity(paper.pose)
  })
  var { x, y, offset, page, flip } = tm.tick(t)
  var fudge = 0.01
  paperProps.forEach(function (paper) {
    vec3.copy(paper.offset, offset)
  })

  mat4.rotateY(pose.l1,pose.l1,x*(0.5-fudge))
  mat4.rotateY(pose.l2,pose.l2,-x*(1-fudge))
  mat4.rotateY(pose.l3,pose.l3,x*(0.5-fudge))
  mat4.rotateY(pose.u1,pose.u1,x*(0.5-fudge))
  mat4.rotateY(pose.u2,pose.u2,-x*(1-fudge))
  mat4.rotateY(pose.u3,pose.u3,x*(0.5-fudge))
  mat4.rotateX(pose.u0,pose.u0,x*(1-fudge*2))
  mat4.rotateX(pose.l0,pose.l0,-x*fudge)

  mat4.rotateY(pose.l1,pose.l1,+y*(0.5-fudge))
  mat4.rotateY(pose.l3,pose.l3,+y*(0.5-fudge))
  mat4.rotateY(pose.u1,pose.u1,-y*(1.5-fudge))
  mat4.rotateY(pose.u3,pose.u3,+y*(0.5-fudge))

  mat4.rotateY(pose.l3,pose.l3,
    -page*(PI-fudge)
    +Math.max(0,page-1)*(PI-fudge)*2
    -Math.max(0,page-2)*(PI-fudge)
  )
  mat4.rotateY(pose.u3,pose.u3,
    +page*(PI-fudge)
    -Math.max(0,page-1)*(PI-fudge)*2
    +Math.max(0,page-2)*(PI-fudge)
  )
  mat4.rotateY(pose.l1,pose.l1,
    -Math.max(0,page-1)*(PI-fudge)
    +Math.max(0,page-2)*(PI-fudge)*2
  )
  mat4.rotateY(pose.u1,pose.u1,
    +Math.max(0,page-1)*(PI-fudge)
    -Math.max(0,page-2)*(PI-fudge)*2
  )
  mat4.rotateY(pose.l0,pose.l0,
    -Math.max(0,page-2)*(PI-fudge)
    + flip
  )
}

function updateModels () {
  paperProps.forEach(function (paper) {
    mat4.identity(paper.model)
    var p = paper
    while (p) {
      mat4.identity(tmpm)
      mat4.translate(tmpm, tmpm, p.pivot)
      mat4.multiply(tmpm, tmpm, p.pose)
      mat4.translate(tmpm, tmpm, vec3.negate(tmpv,p.pivot))
      mat4.multiply(paper.model, tmpm, paper.model)
      p = papers[p.parent]
    }
  })
}

function paper (regl) {
  return regl({
    frag: `
      precision highp float;
      #extension GL_OES_standard_derivatives: enable
      uniform vec3 color;
      varying vec3 vpos;
      void main () {
        vec3 N = normalize(cross(dFdx(vpos),dFdy(vpos)));
        gl_FragColor = vec4(color + (0.5+N*0.5)*0.2,1);
      }
    `,
    vert: `
      precision highp float;
      uniform mat4 projection, view, model;
      uniform vec3 offset;
      attribute vec2 position;
      varying vec3 vpos;
      void main () {
        vpos = (model * vec4(position,0,1)).xyz + offset;
        gl_Position = projection * view * vec4(vpos,1);
      }
    `,
    uniforms: {
      color: regl.prop('color'),
      model: regl.prop('model'),
      offset: regl.prop('offset')
    },
    attributes: {
      position: regl.prop('positions')
    },
    elements: regl.prop('cells')
  })
}
