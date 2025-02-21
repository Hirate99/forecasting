import React, { useMemo, useRef } from 'react';

import { IInputField, InputField } from './input-field';

export function useInputFields(
  num: number,
): [
  { clear: () => void; check: () => boolean },
  (<T = string>(props: IInputField<T>) => React.JSX.Element)[],
] {
  const ref = useRef<
    ({ clear: () => void; check: () => boolean } | undefined)[]
  >(Array(num).fill(undefined));

  const fields = useMemo(
    () =>
      Array(num)
        .fill(undefined)
        .map((_, idx) => {
          return <T,>(props: IInputField<T>) => {
            return (
              <InputField<T>
                {...props}
                ref={(_ref) => {
                  ref.current[idx] = _ref ?? undefined;
                }}
              />
            );
          };
        }),
    [num],
  );

  return [
    {
      clear: () => {
        ref.current.forEach((fn) => {
          fn?.clear();
        });
      },
      check: () => {
        return ref.current
          .map((fn) => !!fn?.check())
          .reduce((prev, curr) => prev && curr, true);
      },
    },
    fields,
  ];
}
