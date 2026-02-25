import ActionDialog from "@/components/ActionDialog";
import React, { useState, useEffect } from "react";

export default function HandoverDialog({ open, onClose, handover, onSubmit }) {
    const [handoverDate, setHandoverDate] = useState("");
    const [handoverTime, setHandoverTime] = useState("");
    const [handoverToPerson, setHandoverToPerson] = useState("");
    const [handoverToContact, setHandoverToContact] = useState("");

    const [keysReturned, setKeysReturned] = useState(false);
    const [numberOfKeys, setNumberOfKeys] = useState(0);

    const [accessoriesReturned, setAccessoriesReturned] = useState(false);

    const [accessCardReturned, setAccessCardReturned] = useState(false);
    const [numberOfAccessCards, setNumberOfAccessCards] = useState(0);

    const [parkingCardReturned, setParkingCardReturned] = useState(false);
    const [numberOfParkingCards, setNumberOfParkingCards] = useState(0);

    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        if (handover) {
            setHandoverDate(handover.handover_date ? handover.handover_date.split("T")[0] : "");
            setHandoverTime(handover.handover_date ? handover.handover_date.split("T")[1].slice(0, 5) : "");
            setHandoverToPerson(handover.handover_to_person || "");
            setHandoverToContact(handover.handover_to_contact || "");

            setKeysReturned(handover.keys_returned);
            setNumberOfKeys(handover.number_of_keys || 0);

            setAccessoriesReturned(handover.accessories_returned);

            setAccessCardReturned(handover.access_card_returned);
            setNumberOfAccessCards(handover.number_of_access_cards || 0);

            setParkingCardReturned(handover.parking_card_returned);
            setNumberOfParkingCards(handover.number_of_parking_cards || 0);

            setRemarks(handover.remarks || "");
        }
    }, [handover]);

    const handleSubmit = async () => {
        const handover_datetime = `${handoverDate}T${handoverTime}:00`;

        return await onSubmit({
            handover_date: handover_datetime,
            handover_to_person: handoverToPerson,
            handover_to_contact: handoverToContact,
            keys_returned: keysReturned,
            number_of_keys: numberOfKeys,
            accessories_returned: accessoriesReturned,
            access_card_returned: accessCardReturned,
            number_of_access_cards: numberOfAccessCards,
            parking_card_returned: parkingCardReturned,
            number_of_parking_cards: numberOfParkingCards,
            remarks
        });

    };

    return (
        <ActionDialog
            open={open}
            title="Complete Handover"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText="Update Handover"
        >
            <div className="space-y-4">

                {/* Handover Date & Time */}
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Handover Date</label>
                        <input
                            type="date"
                            value={handoverDate}
                            onChange={(e) => setHandoverDate(e.target.value)}
                            className="border p-1 rounded w-36"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Handover Time</label>
                        <input
                            type="time"
                            value={handoverTime}
                            onChange={(e) => setHandoverTime(e.target.value)}
                            className="border p-1 rounded w-28"
                        />
                    </div>
                </div>

                {/* Handover To */}
                <div className="flex gap-2">
                    <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium">Handover To (Person)</label>
                        <input
                            type="text"
                            value={handoverToPerson}
                            onChange={(e) => setHandoverToPerson(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div className="flex flex-col w-40">
                        <label className="text-sm font-medium">Contact Number</label>
                        <input
                            type="text"
                            value={handoverToContact}
                            onChange={(e) => setHandoverToContact(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                </div>

                {/* Keys */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={keysReturned}
                        onChange={(e) => setKeysReturned(e.target.checked)}
                        className="form-checkbox h-5 w-5"
                    />
                    <span>Keys Returned</span>
                    {keysReturned && (
                        <input
                            type="number"
                            value={numberOfKeys}
                            onChange={(e) => setNumberOfKeys(parseInt(e.target.value))}
                            className="border p-1 rounded w-24"
                            placeholder="No. of Keys"
                        />
                    )}
                </div>

                {/* Access Card */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={accessCardReturned}
                        onChange={(e) => setAccessCardReturned(e.target.checked)}
                        className="form-checkbox h-5 w-5"
                    />
                    <span>Access Card Returned</span>
                    {accessCardReturned && (
                        <input
                            type="number"
                            value={numberOfAccessCards}
                            onChange={(e) => setNumberOfAccessCards(parseInt(e.target.value))}
                            className="border p-1 rounded w-24"
                            placeholder="No. of Cards"
                        />
                    )}
                </div>

                {/* Parking Card */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={parkingCardReturned}
                        onChange={(e) => setParkingCardReturned(e.target.checked)}
                        className="form-checkbox h-5 w-5"
                    />
                    <span>Parking Card Returned</span>
                    {parkingCardReturned && (
                        <input
                            type="number"
                            value={numberOfParkingCards}
                            onChange={(e) => setNumberOfParkingCards(parseInt(e.target.value))}
                            className="border p-1 rounded w-24"
                            placeholder="No. of Cards"
                        />
                    )}
                </div>

                {/* Accessories */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={accessoriesReturned}
                        onChange={(e) => setAccessoriesReturned(e.target.checked)}
                        className="form-checkbox h-5 w-5"
                    />
                    <span>Accessories Returned</span>
                </div>

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium mb-1">Remarks</label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="border w-full p-2 rounded"
                        rows={3}
                        placeholder="Enter any notes or remarks"
                    />
                </div>
            </div>
        </ActionDialog>
    );
}