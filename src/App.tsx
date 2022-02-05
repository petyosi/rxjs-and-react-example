import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { BehaviorSubject, combineLatest, map, Subscription } from "rxjs";

function useBehaviorSubject<T>(subject: BehaviorSubject<T>) {
  const [value, setValue] = useState(subject.getValue());
  const subscription = useRef<Subscription>();

  useEffect(() => {
    subscription.current = subject.subscribe(setValue);
    return () => subscription.current!.unsubscribe();
  }, [subject]);

  return [value, (newValue: T) => subject.next(newValue)] as const;
}

function system() {
  const a$ = new BehaviorSubject<string>("?");
  const b$ = new BehaviorSubject<string>("?");
  const result$ = new BehaviorSubject<string>("?");

  combineLatest(a$, b$)
    .pipe(
      map(([aValue, bValue]) => {
        const sum = parseInt(aValue, 10) + parseInt(bValue, 10);
        return isNaN(sum) ? "?" : sum.toString();
      })
    )
    .subscribe(result$);

  return { a$, b$, result$ };
}

export default function App() {
  const { a$, b$, result$ } = useMemo(system, []);

  const [aValue, setAValue] = useBehaviorSubject(a$);
  const [bValue, setBValue] = useBehaviorSubject(b$);
  const [resultValue] = useBehaviorSubject(result$);

  return (
    <div>
      <input
        type="text"
        size={3}
        value={aValue}
        onChange={(e) => setAValue(e.target.value)}
      />
      {" + "}
      <input
        type="text"
        size={3}
        value={bValue}
        onChange={(e) => setBValue(e.target.value)}
      />
      {" = "}
      <input size={4} type="text" readOnly value={resultValue} />
    </div>
  );
}
