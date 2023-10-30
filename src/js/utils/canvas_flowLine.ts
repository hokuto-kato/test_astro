export class canvasFlowLine{
  constructor(targetCanvas, canvasParent, startColor, endColor){
    this.canvas = targetCanvas
    this.startColor = startColor
    this.endColor = endColor
    this.ctx = this.canvas.getContext('2d')
    this.endAngle = 2*Math.PI
  }

  drawCircle(circleBound){
    const radius = circleBound.width/2
    this.ctx.fillStyle = `rgba(${circleBound.color[0]}, ${circleBound.color[1]}, ${circleBound.color[2]}, 0.4)`
    this.ctx.beginPath()
    this.ctx.arc(circleBound.left + radius, circleBound.top + radius, radius, 0, this.endAngle)
    this.ctx.fill()

    this.ctx.fillStyle = `rgba(0, 0, 0, 0.05)`
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  clearCanvas(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  resizeCanvas(width, height){
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = height
  }
}
