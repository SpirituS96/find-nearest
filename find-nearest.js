// const storages = [ // массив объектов, хранящий данные о доступности товара в городах
//   {
//     cityID - ID города (Number)
//     isStock - есть ли в наличии (Number)
//   },
// ];

// const destinations = [  // массив объектов, хранящий расстояния меду городами
//   {
//     srcCityID: - ID исходного города (Number)
//     dstCityID: - ID города назначения (Number)
//     distance: - расстояние между ними (Number)
//   },
// ];

function searchNearest(storages, destinations, cityDeliveryID) {
  const stocked = storages
    .filter((item) => item.isStock > 0)
    .map((item) => item.cityID); // фильтрация складов с товаром в наличии

  // если товар есть в наличии в городе доставки
  if (isStocked(cityDeliveryID, stocked)) {
    return {
      nearestCityID: cityDeliveryID,
      distance: 0,
      path: [],
    }; // вернуть ID этого города
  }

  let endNode = null; // инициализация bитогового ближайшего города доставки

  // создание графа связи между городами
  const graph = {};
  for (const item in destinations) {
    const { srcCityID, dstCityID, distance } = destinations[item];
    if (!graph.hasOwnProperty(srcCityID)) {
      // если узел ещё не создан
      graph[srcCityID] = Object({ [dstCityID]: distance }); // создать узел и добавить ребра
    } else {
      graph[srcCityID][dstCityID] = distance; // иначе добавить ребра к существующему узлу
    }
  }

  // отслеживание расстояния от начального узла
  let distances = {};
  distances[endNode] = "Infinity";
  distances = Object.assign(distances, graph[cityDeliveryID]);

  // отслеживание пути
  let parents = { endNode: null };
  for (let child in graph[cityDeliveryID]) {
    parents[child] = cityDeliveryID;
  }

  let visited = []; // посещенные города

  let node = shortestDistanceNode(distances, visited); // поиск ближайшего города

  do {
    // если город имеет товар в наличии
    if (isStocked(node, stocked)) {
      endNode = node;
      break;
    }
    // поиск расстояния от начального узла и дочерних узлов
    let distance = distances[node];
    let children = graph[node];
    // для каждого из дочерних узлов
    for (let child in children) {
      // убедиться что дочерний узел не является начальным
      if (parseInt(child) === cityDeliveryID) {
        continue;
      } else {
        // сохранить расстояние от начального узла до дочернего
        let newDistance = distance + children[child];
        // если нет расстояния от начального узла до дочернего
        // или если новое расстояние короче чем ранее сохраненное расстояние от начального узла до дочернего
        if (!distances[child] || distances[child] > newDistance) {
          // сохранить расстояние
          distances[child] = newDistance;
          // сохранить путь
          parents[child] = node;
        }
      }
    }
    // переместить текущий узел в посещенные
    visited.push(node);

    // перейти к следующему ближайшему узлу
    node = shortestDistanceNode(distances, visited);
  } while (node);

  // используя сохраненный путь от изначального узла до искомого
  // записывается кратчайший путь
  let shortestPath = [endNode];
  let parent = parents[endNode];
  while (parent) {
    shortestPath.push(parent);
    parent = parents[parent];
  }

  // нормализация ID
  shortestPath = shortestPath.map(item => parseInt(item))

  // вернуть:
  // 1) id ближайшего города, из которого будет осуществлена доставка
  // 2) протяженность маршрута
  // 3) id городов, через который проследует груз 
  return {
    nearestCityID: parseInt(endNode),
    distance: distances[endNode],
    path: shortestPath,
  };
}

let shortestDistanceNode = (distances, visited) => {
  // создать кратчайшее расстояние по умолчанию
  let shortest = null;
  // для каждого узла
  for (let node in distances) {
    // если ещё не был присвоен кратчайший узел
    // или если текущее расстояние до узла меньше чем кратчайшее расстояние
    let currentIsShortest =
      shortest === null || distances[node] < distances[shortest];

    // и если текущий узел не в списке посещенных
    if (currentIsShortest && !visited.includes(node)) {
      // обновить кратчайшее расстояние текущим расстоянием до узла
      shortest = node;
    }
  }
  return shortest;
};

function isStocked(cityID, stocked) {
  cityID = parseInt(cityID);
  // проверка есть ли товар в наличии в текущем городе
  for (let item in stocked) {
    if (stocked[item] === cityID) {
      return true;
    }
  }
  return false;
}

