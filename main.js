var regl = require('regl')({
  extensions: ['oes_standard_derivatives']
})
var camera = require('regl-camera')(regl, {
  distance: 8, theta: Math.PI/4, phi: 0.2
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

var draw = {
  paper: paper(regl)
}
regl.frame(function (context) {
  regl.clear({ color: [0.4,0.2,0.2,1], depth: true })
  camera(function () {
    draw.paper(paperProps)
  })
  update(context.time)
  updateModels()
})

var steps = [
  { x: 0, y: 0, t: 1 },
  { x: 1, y: 0, t: 1 },
  { x: 1, y: 1, t: 1 }
]
var stepIndex = 0

function update (t) {
  paperProps.forEach(function (paper) {
    mat4.identity(paper.pose)
  })
  
  mat4.rotateY(papers.l1.pose,papers.l1.pose,x*0.5)
  mat4.rotateY(papers.l2.pose,papers.l2.pose,-x)
  mat4.rotateY(papers.l3.pose,papers.l3.pose,x*0.5)
  mat4.rotateY(papers.u1.pose,papers.u1.pose,x*0.5)
  mat4.rotateY(papers.u2.pose,papers.u2.pose,-x)
  mat4.rotateY(papers.u3.pose,papers.u3.pose,x*0.5)
  mat4.rotateX(papers.u0.pose,papers.u0.pose,x)
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
      attribute vec2 position;
      varying vec3 vpos;
      void main () {
        vpos = (model * vec4(position,0,1)).xyz;
        gl_Position = projection * view * model
          * vec4(position,0,1);
      }
    `,
    uniforms: {
      model: regl.prop('model')
    },
    attributes: {
      position: regl.prop('positions')
    },
    elements: regl.prop('cells')
  })
}
