import React, { forwardRef, useEffect, useMemo, useState } from 'react';

import {
  Autocomplete,
  Grow,
  Paper,
  type PaperProps,
  MenuItem,
  type MenuItemProps,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import { clsx } from 'clsx';
import { Button, FormControlProps } from 'react-bootstrap';
import { ListNested, Search } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import { distinct, from, map, of, switchMap, toArray } from 'rxjs';

import { placeApi } from '@/apis/gmap';
import { useWeatherStore } from '@/store/weather';
import { useInputFields, type IInputField } from './input-field';

import { STATES } from '@/utils/const';

const ForwardedPaperComponent = forwardRef<HTMLDivElement, PaperProps>(
  ({ elevation = 6, ...props }, ref) => {
    return (
      <Grow in>
        <Paper {...props} elevation={elevation} ref={ref} />
      </Grow>
    );
  },
);

interface IFormGroup {
  title?: string;
  children?: React.ReactNode;
}

function FormGroup({ children, title }: IFormGroup) {
  return (
    <Form.Group className="tw-flex tw-flex-col tw-my-1 sm:tw-flex-row sm:tw-justify-center tw-self-stretch sm:tw-items-center tw-mx-4 sm:tw-mx-[12%]">
      <Form.Label className="tw-m-0 tw-flex-grow">
        {title}
        <span className="tw-text-red-600">*</span>
      </Form.Label>
      <div className="sm:tw-w-[80%]">{children}</div>
    </Form.Group>
  );
}

function MUIAutoCompleteItem({
  className,
  selected,
  option,
  props,
}: {
  className?: string;
  selected?: boolean;
  option?: string;
  props: MenuItemProps;
}) {
  return (
    <MenuItem
      {...props}
      className={clsx(props.className, 'tw-w-full tw-relative', className)}
    >
      {option}
      {selected && (
        <Check className="tw-absolute tw-right-3" fontSize="small" />
      )}
    </MenuItem>
  );
}

interface ICity {
  city: string;
  state?: string;
}

function CityInput({
  onChange,
  onClear,
  value,
  CityInputField,
  required = true,
}: {
  onChange?: (city?: ICity) => void;
  onClear?: () => void;
  value?: string;
  CityInputField: <T>(props: IInputField<T>) => React.JSX.Element;
  required?: boolean;
}) {
  const autocomplete = useMemo(async () => {
    return new (await placeApi).AutocompleteService();
  }, []);

  const predictCity = useMemo(
    () =>
      async (input = '') => {
        const prediction = await (
          await autocomplete
        ).getPlacePredictions({
          input,
          types: ['(cities)'],
          language: 'en-US',
          componentRestrictions: {
            country: 'us',
          },
        });

        return prediction;
      },
    [autocomplete],
  );

  const [predictedCities, setPredictedCities] = useState<ICity[]>([]);

  const options = useMemo(
    () => predictedCities.map(({ city }) => city),
    [predictedCities],
  );

  return (
    <FormGroup title="City">
      <CityInputField<ICity>
        required={required}
        value={value}
        onClear={() => {
          setPredictedCities([]);
          onClear?.();
        }}
        onValueChange={(value) => {
          onChange?.(value);
        }}
      >
        {({ valid, required, onBlur, value, onChange }) => (
          <>
            <Autocomplete
              freeSolo
              value={value}
              onChange={(_, name) => {
                onChange?.(predictedCities.find(({ city }) => city === name));
              }}
              renderInput={(params) => {
                return (
                  <div
                    className={clsx('tw-relative', {
                      'tw-mb-5': !valid,
                    })}
                    ref={params.InputProps.ref}
                  >
                    <Form.Control
                      {...(params.inputProps as unknown as FormControlProps)}
                      required={required}
                      disabled={!required}
                      value={value}
                      isInvalid={!valid}
                      onBlur={(e) => {
                        const _e =
                          e as unknown as React.FocusEvent<HTMLInputElement>;
                        const value = e.target.value;

                        params.inputProps.onBlur?.(_e);
                        onBlur?.(value ? { city: value } : undefined);
                      }}
                      onChange={(e) => {
                        const current = e.target.value;
                        onChange?.({
                          city: current,
                          state: '',
                        });

                        of(current)
                          .pipe(
                            switchMap((current) =>
                              current ? from(predictCity(current)) : from([]),
                            ),
                            switchMap((res) => res.predictions),
                            map(({ terms }) => ({
                              city: terms.at(0)?.value ?? '',
                              state: terms.at(1)?.value ?? '',
                            })),
                            distinct(({ city }) => city),
                            toArray(),
                          )
                          .subscribe(setPredictedCities);

                        params.inputProps.onChange?.(
                          e as unknown as React.ChangeEvent<HTMLInputElement>,
                        );
                      }}
                    />
                    <Form.Control.Feedback
                      className="tw-mt-0 tw-absolute tw-top-full"
                      type="invalid"
                    >
                      Please enter a valid city
                    </Form.Control.Feedback>
                  </div>
                );
              }}
              options={options}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                  <MUIAutoCompleteItem
                    key={key}
                    props={optionProps}
                    selected={selected}
                    option={option}
                  />
                );
              }}
              PaperComponent={ForwardedPaperComponent}
            />
          </>
        )}
      </CityInputField>
    </FormGroup>
  );
}

export interface IWeatherLocationInput {
  street?: string;
  city?: string;
  state: string;
}

interface IWeatherLocationForm {
  className?: string;
  onSubmit?: (data: {
    location: IWeatherLocationInput;
    autoDetect?: boolean;
  }) => void;
  onClear?: () => void;
}

function InnerWeatherLocationForm(
  { className, onClear, onSubmit }: IWeatherLocationForm,
  ref: React.Ref<HTMLFormElement>,
) {
  const [
    { clear, check },
    [StreetInputField, CityInputField, StateInputField],
  ] = useInputFields(3);

  const statesNameMap = useMemo(
    () =>
      Object.entries(STATES).reduce<Record<string, string>>(
        (prev, [key, value]) => ({
          ...prev,
          [value]: key,
        }),
        {},
      ),
    [],
  );

  const [autoDetect, setAutoDetect] = useState(false);
  const [location, setLocation] = useState<IWeatherLocationInput>({
    street: '',
    city: '',
    state: '',
  });

  const hasNoEmptyFields = useMemo(
    () => location.street && location.city && location.state,
    [location],
  );

  const [hasValidIpInfo, setHasValidIpInfo] = useState(true);

  useEffect(() => {
    setHasValidIpInfo(true);
  }, [location]);

  const weatherStore = useWeatherStore();

  useEffect(() => {
    return weatherStore.on('update', (e) => {
      if (e.progress || e.error || e.weather) {
        setHasValidIpInfo(true);
      }
    });
  }, [weatherStore]);

  return (
    <>
      <Form
        className={clsx(className, 'tw-flex tw-flex-col tw-items-center')}
        ref={ref}
      >
        <div className="tw-p-1 tw-text-2xl tw-mt-2">Weather Search⛅</div>
        <div className="tw-self-stretch tw-flex-col tw-flex tw-items-center">
          <FormGroup title="Street">
            <StreetInputField
              required={!autoDetect}
              onValueChange={(street) => {
                setLocation((location) => ({
                  ...location,
                  street: street ?? '',
                }));
              }}
              onClear={() => {
                setLocation((location) => ({
                  ...location,
                  street: '',
                }));
              }}
              value={location.street}
            >
              {({ valid, required, onBlur, onChange }) => {
                return (
                  <>
                    <Form.Control
                      required={required}
                      disabled={!required}
                      value={location.street}
                      onChange={(e) => onChange?.(e.target.value)}
                      isInvalid={!valid}
                      onBlur={(e) => onBlur?.(e.target.value)}
                    />
                    <Form.Control.Feedback className="tw-mt-0" type="invalid">
                      Please enter a valid street
                    </Form.Control.Feedback>
                  </>
                );
              }}
            </StreetInputField>
          </FormGroup>
          <CityInput
            value={location.city}
            onChange={(city) => {
              setLocation((location) => ({
                ...location,
                city: city?.city ?? '',
                state: city?.state ?? location.state,
              }));
            }}
            onClear={() => {
              setLocation((location) => ({
                ...location,
                city: '',
              }));
            }}
            CityInputField={CityInputField}
            required={!autoDetect}
          />
          <FormGroup title="State">
            <StateInputField
              required={!autoDetect}
              value={location.state}
              onClear={() => {
                setLocation((location) => ({
                  ...location,
                  state: '',
                }));
              }}
            >
              {({ valid, required, onBlur, value, onChange }) => {
                const current = value ?? '';
                const currentState =
                  current in statesNameMap ? statesNameMap[current] : current;
                return (
                  <>
                    <Autocomplete
                      className="sm:tw-w-[40%]"
                      freeSolo
                      onChange={(_, state) => {
                        onChange?.(state ?? '');
                        setLocation((location) => ({
                          ...location,
                          state: state
                            ? (STATES[state as keyof typeof STATES] ?? '')
                            : '',
                        }));
                      }}
                      value={currentState}
                      renderInput={(params) => {
                        return (
                          <div
                            className="tw-relative"
                            ref={params.InputProps.ref}
                          >
                            <Form.Control
                              {...(params.inputProps as unknown as FormControlProps)}
                              value={currentState}
                              required={required}
                              disabled={!required}
                              isInvalid={!valid}
                              onBlur={(e) => {
                                const _e =
                                  e as unknown as React.FocusEvent<HTMLInputElement>;

                                params.inputProps.onBlur?.(_e);
                                onBlur?.(e.target.value);
                              }}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChange?.(val);
                                params.inputProps.onChange?.(
                                  e as unknown as React.ChangeEvent<HTMLInputElement>,
                                );
                                if (!(val in STATES)) {
                                  setLocation((location) => ({
                                    ...location,
                                    state: val,
                                  }));
                                }
                              }}
                              placeholder="Select your state"
                            />
                          </div>
                        );
                      }}
                      options={Object.entries(STATES).map(([key]) => key)}
                      renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                          <MUIAutoCompleteItem
                            key={key}
                            props={optionProps}
                            selected={selected}
                            option={option}
                          />
                        );
                      }}
                      PaperComponent={ForwardedPaperComponent}
                    />
                  </>
                );
              }}
            </StateInputField>
          </FormGroup>
        </div>
        <div className="tw-self-stretch tw-bg-gray-400 tw-h-[1px] tw-mx-4 sm:tw-mx-[12%] tw-my-3" />
        <div className="tw-items-center tw-self-stretch tw-justify-center tw-flex tw-gap-x-3">
          <div>
            Autodetect Location<span className="tw-text-red-600">*</span>
          </div>
          <Form.Check
            className="tw-mb-0 focus:[&>.form-check-input]:tw-shadow-none [&>.form-check-input]:tw-rounded-sm [&>.form-check-input]:tw-border-gray-500 checked:[&>.form-check-input]:tw-bg-yellow-400 checked:[&>.form-check-input]:tw-border-yellow-400"
            type="checkbox"
            label="Current Location"
            checked={autoDetect}
            onChange={(e) => {
              setHasValidIpInfo(true);
              setAutoDetect(e.target.checked);
            }}
          />
        </div>
        <div className="tw-flex tw-items-center tw-justify-center tw-p-2 tw-gap-x-2">
          <Button
            className="tw-flex tw-items-center tw-gap-x-1"
            onClick={() => {
              if (!autoDetect && !check()) {
                return;
              }
              setHasValidIpInfo(false);
              onSubmit?.({ location, autoDetect });
            }}
            disabled={!hasValidIpInfo || !(autoDetect || hasNoEmptyFields)}
          >
            <Search />
            Search
          </Button>
          <Button
            className="tw-flex tw-items-center tw-gap-x-1"
            variant="outline-secondary"
            onClick={() => {
              onClear?.();
              setHasValidIpInfo(true);
              setAutoDetect(false);
              clear();
            }}
          >
            <ListNested />
            Clear
          </Button>
        </div>
      </Form>
    </>
  );
}

export const WeatherLocationForm = forwardRef(InnerWeatherLocationForm);
