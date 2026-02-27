export type AppLocation = {
  city: string;
  country: string;
};

export type AppStateContextValue = {
  location: AppLocation;
  setLocation: (next: AppLocation) => void;
};
