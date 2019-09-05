
import { Component, OnInit } from '@angular/core';

import { Observable, fromEvent, interval, timer, of, } from 'rxjs';
import { merge, takeUntil, scan, map, switchMap} from 'rxjs/operators';
import { exhaustMap, take } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  timerValue = 0;
  timer$: Observable<any>;

  addZero = (value: number) => {
    return value < 10 ? '0' + value : ('' + value);
  };

  startTimer() {
    const startBtn$ = fromEvent(document.getElementById('start'), 'click');
    const stopBtn$ = fromEvent(document.getElementById('stop'), 'click');
    const resetBtn$ = fromEvent(document.getElementById('reset'), 'click');
    const waitBtn$ = fromEvent(document.getElementById('wait'), 'click');


    // -------------- wait---------

    const waitButton = waitBtn$.pipe(exhaustMap(() =>
      waitBtn$.pipe(take(2), takeUntil(interval(300))
      )));

    const startButton = startBtn$.pipe(
      switchMap(() => timer(this.timerValue, 1000))
    );

    this.timer$ = of(this.timerValue)
      .pipe(
        merge(
          startButton.pipe(
            takeUntil(resetBtn$),
            takeUntil(waitButton),
            takeUntil(stopBtn$),
            map(() => 1)
          ),
          resetBtn$.pipe(
            map(() => 0)
          ),

        ),
        scan((acc, val) => val === 0 ? 0 : acc + val)
      );

    this.timer$.subscribe(value => {
      this.timerValue = value;
    });
  }

  getTimerSeconds() {
    return this.addZero(this.timerValue % 60);
  }

  getTimerMinutes() {
    return this.addZero(Math.floor(this.timerValue / 60) % 60);
  }

  getTimerHours() {
    return this.addZero(Math.floor(this.timerValue / 3600) % 12);
  }
}
