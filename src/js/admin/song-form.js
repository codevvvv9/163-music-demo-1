{
  let view = {
    el: '.page > main',
    init(){
      this.$el = $(this.el)
    },
    template: `
    <form action="" class="form">
      <div class="row">
        <label for="">
          歌名
        </label>
        <input type="text" name="name" value="__name__" id="">
      </div>
      <div class="row">
        <label for="">
          歌手
        </label>
        <input type="text" name="singer" value="__singer__"id="">
      </div>
      <div class="row">
        <label for="">
          外链
        </label>
        <input type="text" name="url" value="__url__" id="">
      </div>
      <div class="row">
      <label for="">
        封面
      </label>
      <input type="text" name="cover" value="__cover__" id="">
    </div>
      <div class="row actions">
        <button type="submit">保存</button>
      </div>
    </form>
    `,
    render(data = {}) {
      let placeholders = ['name', 'url', 'singer', 'id', 'cover']
      let html = this.template
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '') //不写或就会是undefined
      })
      $(this.el).html(html)
      if (data.id) {
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
    },
    reset() {
      this.render({})

    }
  }

  let model = {
    data: {
      name: '', singer: '', url: '', id: '', cover: ''
    },
    update(data) {
      // 第一个参数是 className，第二个参数是 objectId
      var song = AV.Object.createWithoutData('Song', this.data.id);
      // 修改属性
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
      // 保存到云端
      return song.save().then((response) => {
        Object.assign(this.data, data)
        return response
      });
    },
    create(data) {
      // 声明类型
      var Song = AV.Object.extend('Song');
      // 新建对象
      var song = new Song();
      // 设置名称
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
      //返回的就是一个promise
      return song.save().then( (newSong)=> {
        console.log(newSong);
        let {id, attributes} = newSong
        // Object.assign(this.data, {
        //   id: id,
        //   name: attributes.name,
        //   singer: attributes.singer,
        //   url: attributes.url
        // })
        //和上面的写法一样
        Object.assign(this.data, {
          id,
          ...attributes
        })
      }, (error) => {
        console.error(error);
      });
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.view.render(this.model.data)
      this.bindEvents()
     
      window.eventHub.on('select', (data) => {
        this.model.data = data
        this.view.render(this.model.data)
      })
      window.eventHub.on('new', (data) => {
        // if (data === undefined) {
        //   data = {
        //     name: '', url: '', id: '', singer: ''
        //   }
        // }
        // this.model.data = data
        // data = data || {name: '', url: '', id: '', singer: ''}
        // this.model.data = data
        if (this.model.data.id) {
          this.model.data = {
            name: '', url: '', id: '', singer: ''
          }
        }else {
          Object.assign(this.model.data, data)
        }
        this.view.render(this.model.data)

      })
    },
    create() {
      let needs = 'name singer url cover'.split(' ')
      let data = {}
      needs.map((string) => {
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.create(data)
        .then(() => {
          this.view.reset()
          //为了避免两次传的值一样，采用下面的代码
          let string = JSON.stringify(this.model.data)
          let object = JSON.parse(string)
          // window.eventHub.emit('create', this.model.data)
          window.eventHub.emit('create', object)
        })
    },
    update() {
      let needs = 'name singer url cover'.split(' ')
      let data = {}
      needs.map((string) => {
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.update(data)
        .then(() => {
          window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
        })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
       
        if (this.model.data.id) {
          this.update()
        }else {
          this.create()
        }
      })
    }
    
  }
  controller.init(view, model)
}