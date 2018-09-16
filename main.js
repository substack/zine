var regl = require('regl')({
  extensions: ['oes_standard_derivatives']
})
var camera = require('regl-camera')(regl, {
  distance: 4, theta: -Math.PI/2, phi: 0.4,
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
    pivot: [0.0,0.0,0.0]
  },
  l1: {
    parent: 'l0',
    positions: [+0.5,-0.5,+1.5,-0.5,+1.5,+0.5,+0.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [0.5,0.5,0.0]
  },
  l2: {
    parent: 'l1',
    positions: [+1.5,-0.5,+2.5,-0.5,+2.5,+0.5,+1.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [1.5,0.5,0.0]
  },
  l3: {
    parent: 'l2',
    positions: [+2.5,-0.5,+3.5,-0.5,+3.5,+0.5,+2.5,+0.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [2.5,0.5,0.0]
  },
  u0: {
    parent: 'l0',
    positions: [-0.5,+0.5,+0.5,+0.5,+0.5,+1.5,-0.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+0.0,+0.5,0.0]
  },
  u1: {
    parent: 'u0',
    positions: [+0.5,+0.5,+1.5,+0.5,+1.5,+1.5,+0.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+0.5,+0.5,0.0]
  },
  u2: {
    parent: 'u1',
    positions: [+1.5,+0.5,+2.5,+0.5,+2.5,+1.5,+1.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+1.5,+0.5,0.0]
  },
  u3: {
    parent: 'u2',
    positions: [+2.5,+0.5,+3.5,+0.5,+3.5,+1.5,+2.5,+1.5],
    cells: [[0,1,2],[0,2,3]],
    pose: new Float32Array(16),
    model: new Float32Array(16),
    pivot: [+2.5,+0.5,0.0]
  }
}
var paperProps = Object.values(papers)
var pose = {}
Object.keys(papers).forEach(function (key) {
  pose[key] = papers[key].pose
  papers[key].offset = [0,0,0]
})

var draw = {
  paper: paper(regl)
}
regl.frame(function (context) {
  regl.clear({ color: [0.2,0.0,0.2,1], depth: true })
  camera(function () {
    draw.paper(paperProps)
  })
  update(context.time)
  updateModels()
})

var ease = require('eases')
var PI = Math.PI
var states = require('./states.js')('A', {
  A: {
    state: { x: 0.1, y: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut },
    t: 1,
    next: 'B'
  },
  B: {
    state: { x: PI, y: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut },
    t: 1,
    next: 'C'
  },
  C: {
    state: { x: PI, y: PI },
    easing: { x: ease.sineOut, y: ease.sineOut },
    t: 1,
    next: 'D'
  },
  D: {
    state: { x: PI, y: PI },
    easing: { x: ease.sineOut, y: ease.sineOut },
    t: 1,
    next: 'E'
  },
  E: {
    state: { x: PI, y: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut },
    t: 1,
    next: 'F'
  },
  F: {
    state: { x: 0.1, y: 0 },
    easing: { x: ease.sineOut, y: ease.sineOut },
    t: 1,
    next: 'A'
  }
})

function update (t) {
  paperProps.forEach(function (paper) {
    mat4.identity(paper.pose)
  })
  var { x, y } = states.tick(t)
  var fudge = 0.01
  paperProps.forEach(function (paper) {
    paper.offset[0] = (x + y)*0.25 - 1.5
  })

  mat4.rotateY(pose.l1,pose.l1,x*0.5)
  mat4.rotateY(pose.l2,pose.l2,-x)
  mat4.rotateY(pose.l3,pose.l3,x*0.5)
  mat4.rotateY(pose.u1,pose.u1,x*0.5)
  mat4.rotateY(pose.u2,pose.u2,-x)
  mat4.rotateY(pose.u3,pose.u3,x*0.5)
  mat4.rotateX(pose.u0,pose.u0,x*(1-fudge*2))
  mat4.rotateX(pose.l0,pose.l0,-x*fudge)

  mat4.rotateY(pose.l1,pose.l1,y*(0.5-fudge))
  mat4.rotateY(pose.l3,pose.l3,y*(0.5-fudge))
  mat4.rotateY(pose.u1,pose.u1,-y*(1.5-fudge))
  mat4.rotateY(pose.u3,pose.u3,+y*(0.5-fudge))
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
      varying vec3 vpos;
      void main () {
        vec3 N = normalize(cross(dFdx(vpos),dFdy(vpos)));
        gl_FragColor = vec4(N*0.5+0.5,1);
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
      model: regl.prop('model'),
      offset: regl.prop('offset')
    },
    attributes: {
      position: regl.prop('positions')
    },
    elements: regl.prop('cells')
  })
}
