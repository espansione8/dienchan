import Database from 'better-sqlite3';
//import { DB_PATH } from '$env/static/private';
import type { Users } from '$lib/types';

const db = new Database(
  import.meta.env.VITE_SQLITE_DB_PATH,
  // { verbose: console.log }
);

export const postFormShop = (
  name: string,
  surname: string,
  email: string,
  shopDay: number,
  shopMonth: number,
  shopYear: number,
  shopHour: number,
  shopMinute: number,
  shopEuro: number,
  shopCents: number,
  win: number,
  dateSubmit: string
): void => {
  const sql = `
  INSERT INTO users (name, surname, email, shopDay, shopMonth, shopYear, shopHour, shopMinute, shopEuro, shopCents, win, dateSubmit )
  VALUES ($name, $surname, $email, $shopDay, $shopMonth, $shopYear, $shopHour, $shopMinute, $shopEuro, $shopCents, $win, $dateSubmit);
  `;
  const stmnt = db.prepare(sql);
  stmnt.run({ name, surname, email, shopDay, shopMonth, shopYear, shopHour, shopMinute, shopEuro, shopCents, win, dateSubmit });
}
export const postFormOnline = (
  name: string,
  surname: string,
  email: string,
  onlineDay: number,
  onlineMonth: number,
  onlineYear: number,
  onlineEuro: number,
  onlineCents: number,
  win: number,
  dateSubmit: string
): void => {
  const sql = `
  INSERT INTO users (name, surname, email, onlineDay, onlineMonth, onlineYear, onlineEuro, onlineCents, win, dateSubmit )
  VALUES ($name, $surname, $email, $onlineYear, $onlineMonth, $onlineDay, $onlineEuro, $onlineCents, $win, $dateSubmit);
  `;
  const stmnt = db.prepare(sql);
  stmnt.run({ name, surname, email, onlineDay, onlineMonth, onlineYear, onlineEuro, onlineCents, win, dateSubmit });
}

// SYNC VERSION
// export const getReport = (limit = 100): Users[] => {
//   const sql = `
//   SELECT *
//   FROM users
//   `;
//   const stmnt = db.prepare(sql);
//   const rows = stmnt.all({ limit });
//   return rows as Users[];
// }

// ASYNC VERSION
export const getReport = (limit = 100): Promise<Users[]> => {
  const sql = `
  SELECT *
  FROM users
  `;
  const stmnt = db.prepare(sql);
  const rows = stmnt.all({ limit });
  return Promise.resolve(rows as Users[]);
}

/// SAMPLEs FOR REFERENCE
// export const getInitialTracks = (limit = 50): Track[] => {
//   const sql = `
//   select t.TrackId as trackId
//   , t.Name
//   , a.AlbumId as albumId
//   , a.Title as albumTitle
//   , at.ArtistId as artistId
//   , at.Name as artistName
//   , g.Name as genre
// from tracks t
// join albums a
//  on t.AlbumId = a.AlbumId
// join artists at
//  on a.ArtistId = at.ArtistId
// join genres g
//  on t.GenreId = g.GenreId
// limit $limit
//   `;
//   const stmnt = db.prepare(sql);
//   const rows = stmnt.all({ limit });
//   return rows as Track[];
// }

// export const getArtist = (limit = 100): Artist[] => {
//   const sql = `
//   SELECT *
//   FROM artists
//   WHERE ArtistId = 135
//   OR Name = 'Audioslave'
//   `;
//   const stmnt = db.prepare(sql);
//   const rows = stmnt.all({ limit });
//   return rows as Artist[];
// }

// export function updateAlbumTitle(albumId: number, albumTitle: string): void {
//   const sql = `
//   UPDATE users
//   SET Title = $albumTitle
//       Number = $albumNumber
//       Title = $albumTitle
//   WHERE AlbumId = $albumId
// `;
//   const stmnt = db.prepare(sql);
//   stmnt.run({ albumId, albumTitle });
// }