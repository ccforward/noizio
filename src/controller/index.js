const Index = {
  async index(ctx, next) {
    const title = 'koa2 title'
    await ctx.render('index', {
      title
    })
  },

  async example(ctx, next) {
    const title = 'report example'
    await ctx.render('example', {
      title
    })
  },

  async test(ctx, next){
    ctx.body = 'test'
  },

  async errors(ctx, next){
    ctx.body = 'errors'
  },
  async performance(ctx, next){
    ctx.body = 'performance'
  }
}


module.exports = Index