{
  let view = {
    el: '#songList-container',
    template: `
    <ul class="songList">
      <li>歌曲1</li>
      <li>歌曲233333</li>
      <li>歌曲3</li>
      <li>歌曲4</li>
      <li>歌曲52222222</li>
      <li>歌曲6</li>
      <li>歌曲7</li>
      <li>歌曲8</li>
      <li>歌曲9</li>
      <li>歌曲1033</li>
    </ul>
    `,
    render(data) {
      $(this.el).html(this.template)
    },
    clearActive() {
      $(this.el).find('.active').removeClass('active')
    }
  }
  let model = {}
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      window.eventHub.on('upload', () => {
        this.view.clearActive()
      })
    }
  }

  controller.init(view, model)
}