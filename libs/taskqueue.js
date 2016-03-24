
function TaskQueue(concurrency) {
  this.queue = [];
  this.concurrency = concurrency;
  this.running = 0;
}

TaskQueue.prototype.push = function(task) {
  this.queue.push(task);
  this.next();
};

TaskQueue.prototype.next = function() {
  var self = this;
  while(self.running < self.concurrency && self.queue.length) {
    var task = self.queue.shift();
    task().then(function() {
      self.running--;
      return self.kickass();
    });
    self.running++;
  }
};

TaskQueue.prototype.kickass = function() {
  var self = this;
  if(self.running < self.concurrency && self.queue.length) {
    var task = self.queue.shift();
    self.running++;
    return task().then(function() {
      self.running--;
      return self.kickass();
    });
  }
};

module.exports = TaskQueue;