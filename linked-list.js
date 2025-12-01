class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.length = 0
  }

  append(value) {
    const newNode = new Node(value)
    if (!this.head) {
      this.head = newNode
    } else {
      let current = this.head
      while (current.next) {
        current = current.next
      }
      current.next = newNode
    }
    this.length++
  }

  prepend(value) {
    const newNode = new Node(value)
    newNode.next = this.head
    this.head = newNode
    this.length++
  }

  remove(value) {
    if (!this.head) return false

    if (this.head.value === value) {
      this.head = this.head.next
      this.length--
      return true
    }

    let current = this.head
    while (current.next && current.next.value !== value) {
      current = current.next
    }

    if (current.next) {
      current.next = current.next.next
      this.length--
      return true
    }

    return false
  }

  find(value) {
    let current = this.head
    while (current) {
      if (current.value === value) return current
      current = current.next
    }
    return null
  }

  toArray() {
    const result = []
    let current = this.head
    while (current) {
      result.push(current.value)
      current = current.next
    }
    return result
  }
}

const list = new LinkedList()
list.append(1)
list.append(2)
list.prepend(0)
console.log(list.toArray()) // [0, 1, 2]
