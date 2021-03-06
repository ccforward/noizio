const url = require('url')
const querystring = require('querystring')
const DateCalc = require('date-calc')
const ErrorsDAO = require('../models/errors')
const LatestErrorsDAO = require('../models/latest-errors')
const errorsDAO = new ErrorsDAO()
const latestErrorsDAO = new LatestErrorsDAO()

const dateCalc = new DateCalc()
const parseResult = result => {
  const errs = []
  for(let re of result) {
    const err = {
      link: re.link,
      ua: re.ua,
      ip: re.ip,
      title: re.title,
      size: re.size,
      referer: re.referer,
      time: dateCalc.time(re.timestamp),
      msg: re.msg,
      url: re.url,
      line: re.line,
      col: re.col,
      errStack: re.errStack,
      other: re.other,
      os: re.os,
      dtime: re.dtime,
      date: dateCalc.time(re.date)
    }
    errs.push(err)
  }
  return errs
}
module.exports = {
  async search(ctx, next) {
    const params = querystring.parse(url.parse(ctx.req.url).query)
    const page = parseInt(params.page || 1, 10)
    const limit = parseInt(params.limit || 20, 10)
    if(page<=0 || isNaN(page) || isNaN(limit)) {
      ctx.body = {
        err: 1,
        msg: 'Parameters Error'
      }
      return
    }
    let offset = (page-1)*limit
    let query = {}
    let total = 0
    let errs = []

    if(ctx.params.day) {
      query.dtime = ctx.params.day
    }
    if(ctx.params.month) {
      query.dmonth = ctx.params.month
    }
    if(ctx.params.os) {
      query.os = ctx.params.os
    }
    if(ctx.params.link) {
      query.link = decodeURIComponent(ctx.params.link)
    }

    if(params.days) {
      let d = dateCalc.now()
      const days = []
      let i = 0
      let l = params.days
      for(;i<l;i++) {
        d = new DateCalc(d).before()
        days.push(d)
      }
      ctx.params.day = `${days[0]} - ${days[l-1]}`
      query.dtime = {
        $in: days
      }
    }

    if(~ctx.req.url.indexOf('/latest')) {
      total = await latestErrorsDAO.count(query)
      errs = parseResult(await latestErrorsDAO.search(query, offset, limit))
    }else {
      total = await errorsDAO.count(query)
      errs = parseResult(await errorsDAO.search(query, offset, limit))
    }
    ctx.body = {
      err: 0,
      page: {
        total: Math.ceil(total/limit)
      },
      data: {
        date: ctx.params.day || dateCalc.now(),
        errs: errs
      }
    }
  }
}