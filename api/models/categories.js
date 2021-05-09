import { getAllModels } from './'

const getAllCategories = () => {
  const models = getAllModels()
  const categories = models.reduce((acc, curr) => {
    const cat = curr.info.category
    if (acc[cat]) {
      acc[cat].models.concat(acc)
    } else {
      acc[cat] = {
        name: cat,
        models: [curr],
      }
    }
    return acc
  }, {})

  return Object.values(categories)
}

export default function handler(req, res) {
  const categories = getAllCategories()

  res.status(200).json(categories)
}
