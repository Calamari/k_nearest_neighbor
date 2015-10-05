// TODO:
// - Weights of some features (features have to be defined in the NodeList)
// - Try out:  Large Margin Nearest Neighbor or Neighbourhood components analysis. to optimize KNN

var Node = function(obj, type) {
  this.features = obj;
  this.type = type || null;
};

Node.prototype.clone = function() {
  return new Node(this.features, this.type);
};

Node.prototype.setNeighbors = function(nodes) {
  this.neighbors = [];
  // store neighbors as cloned versions
  for (var i=nodes.length; i--;) {
    this.neighbors.push(nodes[i].clone());
  }
};

Node.prototype.measureDistances = function(featureRanges) {
  for (var i=this.neighbors.length; i--;) {
    var neighbor = this.neighbors[i],
        deltas   = 0;

        // deltaRooms = (neighbor.rooms - this.rooms) / roomsRange,
        // deltaArea  = (neighbor.area - this.area) / areaRange;
    for (var j in neighbor.features) {
      deltas += Math.pow((neighbor.features[j] - this.features[j]) / featureRanges[j].width, 2);
    }

    // neighbor.distance = Math.sqrt(Math.pow(deltaRooms, 2) + Math.pow(deltaArea, 2));
    neighbor.distance = Math.sqrt(deltas);
  }
};

Node.prototype.sortByDistance = function(nodes) {
  this.neighbors.sort(function(a, b) {
    return a.distance - b.distance;
  });
};

Node.prototype.guessType = function(k) {
  var types = {},
      nearestNeighbors = this.neighbors.slice(0, k),
      count = 0,
      guess, i;

  for (i=nearestNeighbors.length; i--;) {
    var neighbor = nearestNeighbors[i];
    if (!types[neighbor.type]) {
      types[neighbor.type] = 0;
    }
    ++types[neighbor.type];
  }

  for (var type in types) {
    if (types[type] > count) {
      guess = type;
      count = types[type];
    }
  }

  return { guess: guess, count: count };
};


var NodeList = function(k, nodes) {
  this.nodes = nodes || [];
  this.k = k;
};

NodeList.prototype.add = function(node) {
  this.nodes.push(node);
};

NodeList.prototype.calculateRanges = function() {
  var ranges = {},
      feat, i;

  for (feat in this.nodes[0].features) {
    range = { min: Number.MAX_VALUE, max: Number.MIN_VALUE };

    for (i=this.nodes.length; i--;) {
      range.min = Math.min(range.min, this.nodes[i].features[feat]);
      range.max = Math.max(range.max, this.nodes[i].features[feat]);
    }
    range.width = range.max - range.min;
    ranges[feat] = range;
  }
  return ranges;
};

NodeList.prototype.determineUnknown = function(unknownNode) {
  // TODO: invalidate and recalulate only when neccessary
  var ranges = this.calculateRanges();

  unknownNode.setNeighbors(this.nodes);

  unknownNode.measureDistances(ranges);
  unknownNode.sortByDistance();
  return unknownNode.guessType(this.k);
};
