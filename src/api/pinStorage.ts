import * as tokenStorage from './tokenStorage';

const PIN_KEY = 'laracontact_app_pin';

export async function hasPin(): Promise<boolean> {
  const pin = await tokenStorage.getItemAsync(PIN_KEY);
  return !!pin;
}

export async function savePin(pin: string): Promise<void> {
  await tokenStorage.setItemAsync(PIN_KEY, pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await tokenStorage.getItemAsync(PIN_KEY);
  return stored !== null && stored === pin;
}

export async function clearPin(): Promise<void> {
  await tokenStorage.deleteItemAsync(PIN_KEY);
}
