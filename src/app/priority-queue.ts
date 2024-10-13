const ARITY = 4;
const LOG2ARITY = 2;
const GROW_FACTOR = 2;

type PriorityQueueNodePriority = number | BigInt | string | object;
export type PriorityQueueNode<TElement, TPriority extends PriorityQueueNodePriority> = [element: TElement, priority: TPriority];

export class PriorityQueue<TElement, TPriority extends PriorityQueueNodePriority> {
    readonly #nodes: PriorityQueueNode<TElement, TPriority>[];
    readonly #comparer: (first: TPriority, second: TPriority) => number;
    #size: number;

    public constructor(params?: {
        readonly items?: PriorityQueueNode<TElement, TPriority>[]
        readonly comparer?: (first: TPriority, second: TPriority) => number
    }) {
        this.#nodes = params?.items ?? [];
        this.#comparer = params?.comparer ?? PriorityQueue.#defaultComparer;
        this.#size = this.#nodes.length;

        if (this.#size > 1) {
            this.#heapify();
        }
    }

    public getElements(): TElement[] {
        return this.#nodes.map((node) => node[0]);
    }

    public enqueue(element: TElement, priority: TPriority): void {
        const currentSize = this.#size;

        if (this.#nodes.length === currentSize) {
            this.#grow(currentSize + 1);
        }

        this.#size = currentSize + 1;

        this.#moveUp([element, priority], currentSize);
    }

    public peek(): TElement {
        if (this.#size === 0) {
            throw new Error('Empty queue');
        }

        return this.#nodes[0][0];
    }

    public tryPeek(): PriorityQueueNode<TElement, TPriority> | undefined {
        if (this.#size === 0) {
            return undefined;
        }

        return this.#nodes[0];
    }

    public dequeue(): TElement {
        if (this.#size === 0) {
            throw new Error('Empty queue');
        }

        const element = this.#nodes[0][0];
        this.#removeRootNode();
        return element;
    }

    public tryDequeue(): PriorityQueueNode<TElement, TPriority> | undefined {
        if (this.#size === 0) {
            return undefined;
        }

        const node = this.#nodes[0];
        this.#removeRootNode();
        return node;
    }

    #grow(minCapacity: number): void {
        let newCapacity = GROW_FACTOR * this.#nodes.length;
        
        if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
        }

        this.#nodes.length = newCapacity;
    }

    #removeRootNode(): void {
        const lastNodeIndex = --this.#size;

        if (lastNodeIndex > 0) {
            const lastNode = this.#nodes[lastNodeIndex];
            this.#moveDown(lastNode, 0);
        }
    }

    #heapify(): void {
        const nodes = this.#nodes;
        const lastParentWithChildren = PriorityQueue.#getParentIndex(this.#size - 1);

        for (let index = lastParentWithChildren; index >= 0; --index) {
            this.#moveDown(nodes[index], index);
        }
    }

    #moveUp(node: PriorityQueueNode<TElement, TPriority>, nodeIndex: number): void {
        const nodes = this.#nodes;

        while (nodeIndex > 0) {
            const parentIndex = PriorityQueue.#getParentIndex(nodeIndex);
            const parent = nodes[parentIndex];

            if (this.#comparer(node[1], parent[1]) < 0) {
                nodes[nodeIndex] = parent;
                nodeIndex = parentIndex;
            } else {
                break;
            }
        }

        nodes[nodeIndex] = node;
    }

    #moveDown(node: PriorityQueueNode<TElement, TPriority>, nodeIndex: number): void {
        const nodes = this.#nodes;
        const size = this.#size;
        let i: number;

        while ((i = PriorityQueue.#getFirstChildIndex(nodeIndex)) < size) {
            let minChild = nodes[i];
            let minChildIndex = i;

            const childIndexUpperBound = Math.min(i + ARITY, size);
            while (++i < childIndexUpperBound) {
                const nextChild = nodes[i];
                if (this.#comparer(nextChild[1], minChild[1]) < 0) {
                    minChild = nextChild;
                    minChildIndex = i;
                }
            }

            if (this.#comparer(node[1], minChild[1]) <= 0) {
                break;
            }

            nodes[nodeIndex] = minChild;
            nodeIndex = minChildIndex;
        }

        nodes[nodeIndex] = node;
    }

    static #defaultComparer(first: PriorityQueueNodePriority, second: PriorityQueueNodePriority): number {
        if (first < second) {
            return -1;
        }

        if (first > second) {
            return 1;
        }

        return 0;
    }

    static #getParentIndex(index: number): number {
        return (index - 1) >> LOG2ARITY;
    }

    static #getFirstChildIndex(index: number): number {
        return (index << LOG2ARITY) + 1;
    }
}
