import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface IInputField<T = string> {
  required?: boolean;
  onValueChange?: (value?: T) => void;
  onClear?: () => void;
  value?: string;
  validate?: (value?: T) => boolean;
  children?: (props: {
    valid: boolean;
    value?: string;
    required?: boolean;
    onBlur?: (e?: T) => void;
    onChange?: (e?: T) => void;
  }) => React.ReactNode;
}

const InputFieldInner = <T,>(
  props: IInputField<T>,
  ref: React.Ref<{ clear: () => void; check: () => boolean }>,
) => {
  const clearRef = useRef<boolean>(true);

  useImperativeHandle(ref, () => ({
    clear: () => {
      clearRef.current = true;
      props.onClear?.();
      setValid(true);
    },
    check: () => {
      const valid = !!props.value;
      setValid(valid);
      return valid;
    },
  }));

  const [valid, setValid] = useState(true);
  const prevValueRef = useRef<string>('');

  useEffect(() => {
    if (!props.required) {
      setValid(true);
    }
  }, [props.required]);

  useEffect(() => {
    if (!clearRef.current) {
      if (props.value === prevValueRef.current) {
        return;
      }
      setValid(!!props.value);
    } else {
      clearRef.current = false;
    }

    prevValueRef.current = props.value ?? '';
  }, [props.value]);

  const onBlur = useCallback(
    (e?: T) => {
      setValid(props.validate ? props.validate(e) : !!e);
    },
    [props],
  );

  const onChange = useCallback(
    (e?: T) => {
      props.onValueChange?.(e);
      setValid(props.validate ? props.validate(e) : !!e);
    },
    [props],
  );

  return (
    <>
      {props.children?.({
        valid,
        onChange,
        onBlur,
        required: props.required,
        value: props.value,
      })}
    </>
  );
};

export const InputField = forwardRef(InputFieldInner);
