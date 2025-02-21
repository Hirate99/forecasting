import { useEffect, useState } from 'react';

import { Alert } from 'react-bootstrap';
import { TrashFill } from 'react-bootstrap-icons';

import type { TFavoriteLocation } from 'backend';

import { useFavoriteStore } from '@/store/favorites';
import { triggerForecast } from '@/services/forecast';
import { STATES } from '@/utils/const';
import { updateFavoriteCity } from '@/services/favorites';

export function FavoriteTab() {
  const [favorites, setFavorites] = useState<TFavoriteLocation[]>([]);

  const favoriteStore = useFavoriteStore();
  useEffect(() => {
    return favoriteStore.on('info', setFavorites);
  }, [favoriteStore]);

  return (
    <>
      {favorites.length ? (
        <table className="tw-w-full tw-text-[13px] sm:tw-text-sm" border={0}>
          <thead>
            <tr className="tw-border-[--bs-border-color] tw-border-b-[1px] [&>th]:tw-py-3">
              <th>#</th>
              <th>City</th>
              <th>State</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {favorites.map(({ city, state }, index) => (
              <tr
                key={index}
                className="tw-border-[--bs-border-color] tw-border-b-[1px] [&>td]:tw-py-2"
              >
                <td>{index + 1}</td>
                <td>
                  <a
                    className="tw-underline tw-text-blue-700 hover:tw-cursor-pointer"
                    onClick={() => {
                      triggerForecast({
                        location: {
                          city,
                          state: STATES[state as keyof typeof STATES],
                        },
                      });
                    }}
                  >
                    {city}
                  </a>
                </td>
                <td>
                  <a className="tw-underline tw-text-blue-700 hover:tw-cursor-pointer">
                    {state}
                  </a>
                </td>
                <td>
                  <button
                    className="tw-flex tw-justify-center tw-items-center"
                    onClick={() => {
                      updateFavoriteCity({
                        city,
                        state,
                        favorite: false,
                      });
                    }}
                  >
                    <TrashFill className="tw-text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Alert variant="warning">Sorry. No records found.</Alert>
      )}
    </>
  );
}
