import { SystemProvider, useBehaviorSubject, useSubjectSetter } from "./system";

function Input({ systemKey }: { systemKey: "a$" | "b$" }) {
  const [value, setValue] = useBehaviorSubject(systemKey);

  return (
    <input
      type="text"
      size={3}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

function Result() {
  const [value] = useBehaviorSubject("result$");

  return <input size={4} type="text" readOnly value={value} />;
}

function Clear() {
  const clear = useSubjectSetter("clear$");
  return (
    <button type="button" onClick={() => clear(null)}>
      Clear
    </button>
  );
}

export default function App() {
  return (
    <SystemProvider>
      <div>
        <Input systemKey="a$" />
        {" + "}
        <Input systemKey="b$" />
        {" = "}
        <Result /> <Clear />
      </div>
    </SystemProvider>
  );
}
