{
  let view = {
    el: '.page > main',
    template: `
    <h1>新建歌曲</h1>
    <form action="" class="form">
      <div class="row">
        <label for="">
          歌名
        </label>
        <input type="text" value="__key__" id="">
      </div>
      <div class="row">
        <label for="">
          歌手
        </label>
        <input type="text"  id="">
      </div>
      <div class="row">
        <label for="">
          外链
        </label>
        <input type="text" value="__link__" id="">
      </div>
      <div class="row actions">
        <button type="submit">保存</button>
      </div>
    </form>
    `,
    render(data = {}) {
      let placeholders = ['key', 'link']
      let html = this.template
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '') //不写或就会是undefined
        console.log(2)

      })
      $(this.el).html(html)
    }
  }

  let model = {}
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      window.eventHub.on('upload', (data) => {
        this.view.render(data)
      })
    },
    
  }
  controller.init(view, model)
}