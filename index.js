const { parseISO, differenceInDays, isAfter, isBefore } = require("date-fns");
const rooms = require("./rooms.json");
const reservations = require("./reservations.json");
const requests = require("./requests.json");

const filterByExistingReservations = (possibleRooms, req) => {
  return possibleRooms.filter((room) => {
    if (room.reservations.length === 0) {
      return true;
    }

    // returns true for reservations that can be valid
    return room.reservations.every((existingReservation) => {
      const requestedCheckIn = parseISO(req.checkin_date);
      const requestedCheckOut = parseISO(req.checkout_date);
      const existingReservationIn = parseISO(existingReservation.checkin_date);
      const existingReservationOut = parseISO(existingReservation.checkout_date);

      const isCheckInBefore = isBefore(requestedCheckIn, existingReservationIn);
      const isCheckOutBefore = isBefore(requestedCheckOut, existingReservationOut);
      const isCheckInAfter = isAfter(requestedCheckIn, existingReservationIn);
      const isCheckOutAfter = isAfter(requestedCheckOut, existingReservationOut);

      return (isCheckInBefore && isCheckOutBefore) || (isCheckInAfter && isCheckOutAfter);
    });
  });
};

const roomState = [...reservations];

// we take a look at a request - and try to fulfill it
requests.forEach((request) => {
  const roomFilters = {};
  roomFilters.minBeds = request.min_beds;
  roomFilters.isSmoker = request.is_smoker;

  const lengthOfStay = differenceInDays(parseISO(request.checkout_date), parseISO(request.checkin_date));

  // we filter by possible rooms
  const possibleRooms = rooms.filter((room) => {
    return room.num_beds >= roomFilters.minBeds && room.allow_smoking === roomFilters.isSmoker;
  });

  console.log({ possibleRooms });

  // add reservations to rooms
  const possibleRoomsWithReservations = possibleRooms.map((room) => {
    const roomWithReservations = roomState
      .filter((ro) => ro.room_id === room.id && ro.checkin_date && ro.checkout_date)
      .map((res) => ({ checkin_date: res.checkin_date, checkout_date: res.checkout_date }));

    return {
      room_id: room.id,
      reservations: roomWithReservations.length > 0 ? roomWithReservations : [],
      costOfStay: lengthOfStay * room.daily_rate + room.cleaning_fee,
    };
  });

  // we are left with the lowest cost room
  const filtered = filterByExistingReservations(possibleRoomsWithReservations, request).reduce((curr, prev) =>
    curr.costOfStay < prev.costOfStay ? curr : prev
  );

  const formattedFilteredRooms = {
    room_id: filtered.room_id,
    checkin_date: request.checkin_date,
    checkout_date: request.checkout_date,
    totalCharge: filtered.costOfStay,
  };

  // push to state so we can work on the next request
  roomState.push(formattedFilteredRooms);
});

console.log({ roomState });
