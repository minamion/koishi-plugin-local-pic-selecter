import { count } from 'console'
import { Context, h, Schema } from 'koishi'
import { ImagerPicker } from './imagepicker'
import { pathToFileURL } from 'url'
import { resolve, join } from 'path'
import * as fs from "fs";
export const name = 'local-pic-selecter'
export interface Config {
  basePath: string
  postfixs: Array<string>
  maxout: number
}
export const inject = ['assets']
export const Config: Schema<Config> = Schema.object({
  basePath: Schema.string().required().description('图库的基本地址'),
  postfixs: Schema.array(String).required().role('table').description('图库的后缀地址,同时也是command的名称'),
  maxout: Schema.number().description('一次最大输出图片数量').default(10),
})


export function apply(ctx: Context, config: Config) {
  for (const postfix of config.postfixs) {
    ctx.command(`${postfix} [count:number]`)
      .action((_, count) => {
        if (!count) {
          count = 1
        }
        if (count > config.maxout) {
          count = config.maxout
        }
        let pickeed = ImagerPicker(config.basePath, postfix, count)
        let res = []
        for (const fname of pickeed) {
          const p = join(config.basePath, postfix, fname)
          let bitmap = fs.readFileSync(p);

          let base64str = Buffer.from(bitmap, 'binary').toString('base64'); // base64编码

          res.push(h.image('data:image/png;base64,' + base64str))
        }
        return res;
      }
      )
  }

}
