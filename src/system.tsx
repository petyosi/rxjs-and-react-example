import {
  useEffect,
  useRef,
  useState,
  createContext,
  FC,
  useContext,
  useMemo
} from "react";

import {
  Subscription,
  BehaviorSubject,
  combineLatest,
  map,
  mapTo,
  Subject
} from "rxjs";

function createSystem() {
  const a$ = new BehaviorSubject<string>("?");
  const b$ = new BehaviorSubject<string>("?");
  const result$ = new BehaviorSubject<string>("?");
  const clear$ = new Subject();

  combineLatest([a$, b$])
    .pipe(
      map(([aValue, bValue]) => {
        const sum = parseInt(aValue, 10) + parseInt(bValue, 10);
        return isNaN(sum) ? "?" : sum.toString();
      })
    )
    .subscribe(result$);

  clear$.pipe(mapTo("?")).subscribe(a$);
  clear$.pipe(mapTo("?")).subscribe(b$);

  return { a$, b$, result$, clear$ };
}

const SystemContext = createContext<ReturnType<typeof createSystem> | null>(
  null
);

type System = ReturnType<typeof createSystem>;

export const SystemProvider: FC = ({ children }) => {
  const system = useMemo(createSystem, []);
  return (
    <SystemContext.Provider value={system}>{children}</SystemContext.Provider>
  );
};

function useSystemContext() {
  return useContext(SystemContext)!;
}

export function useBehaviorSubject<
  Key extends keyof System,
  Value = System[Key] extends BehaviorSubject<infer R> ? R : never
>(key: Key) {
  const subject$ = useSystemContext()[key] as BehaviorSubject<Value>;
  const [value, setValue] = useState(subject$.getValue());
  const subscription = useRef<Subscription>();

  useEffect(() => {
    subscription.current = subject$.subscribe(setValue);
    return () => subscription.current!.unsubscribe();
  }, [subject$]);

  return [value, (newValue: Value) => subject$.next(newValue)] as const;
}

export function useSubjectSetter<
  Key extends keyof System,
  Value = System[Key] extends Subject<infer R> ? R : never
>(key: Key) {
  const subject$ = useSystemContext()[key] as Subject<Value>;
  return (value: Value) => subject$.next(value);
}
