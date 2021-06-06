import { supabase } from '../../../utils/initSupabase'
import { cleanSupabaseData } from '../../../utils/queries/cleanSupaBaseData'
import { listData } from '../../../utils/queries/list'

export const getInfo = async (type, slug) => {
  const creatorRequest = await supabase
    .from(type)
    .select()
    .eq('url', slug)
    .limit(1)
  const creator = creatorRequest.data[0]
  let assets = {}
  const promiseToWait = Object.keys(listData).map(async (t) => {
    const assetTypeData = await supabase
      .from(t)
      .select(listData[t])
      .eq(type.slice(0, -1), creator.id)

    assets[t] = cleanSupabaseData(assetTypeData.data)
  })

  await Promise.all(promiseToWait)
  return {
    ...creator,
    ...assets,
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  const assetType = req.query.type
  if (assetType !== 'creators' && assetType !== 'teams') {
    res.status(404).json({})
    return
  }
  const name = req.query.name
  const data = await getInfo(assetType, name)
  res.status(200).json(data)
}
