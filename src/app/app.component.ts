import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PriorityQueue } from './priority-queue';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'priority-queue';

  public ngOnInit(): void {
    const testData: number[] = [];
    const cnt = 1000;

    for (let i = 0; i < 100000; i++) {
      const rnd = Math.floor(Math.random() * 10000000);
      if (rnd === 0) {
        i--;
        continue;
      }
      testData.push(Math.abs(rnd));
    }

    // testData.push(1);
    // testData.push(3);
    // testData.push(8);
    // testData.push(100);

    console.log(`Sum: ${sum(testData)}`);

    // 0
    let start = Date.now();
    let result = solution0([...testData], cnt);
    let stop = Date.now();
    console.log(`0 - ${stop - start} - ${result}`);

    // 1
    start = Date.now();
    result = solution1([...testData], cnt);
    stop = Date.now();
    console.log(`1 - ${stop - start} - ${result}`);
  }
}

function solution0(prices: number[], m: number): number {
  const lastIdx = prices.length - 1;

  for (let i = 0; i < m; i++) {
    prices.sort((a, b) => a - b);
    prices[lastIdx] = Math.floor(prices[lastIdx] / 2);
  }

  return sum(prices);
}

function solution1(prices: number[], m: number): number {
  const queue = new PriorityQueue<number, number>({
    items: prices.map((price) => [price, -price])
  });

  for (let i = 0; i < m; i++) {
    const price = queue.dequeue();

    if (price > 0) {
      const discounted = Math.floor(price / 2);
      queue.enqueue(discounted, -discounted);
    } else {
      break;
    }
  }

  return sum(queue.getElements());
}

function sum(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((acc, cur) => acc + cur, 0);
}