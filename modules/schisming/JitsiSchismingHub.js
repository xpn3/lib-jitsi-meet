/* global __filename, module */
import { getLogger } from 'jitsi-meet-logger';

const logger = getLogger(__filename);

export default class JitsiSchismingHub {
    constructor() {
        this._schismingGroupByParticipantJid = {};
    }

    _setTestState(thisParticipantJid, otherParticipants) {
        this._schismingGroupByParticipantJid[thisParticipantJid] = '1';
        if(otherParticipants.length >= 1) {
            this._schismingGroupByParticipantJid[otherParticipants[0].getJid()] = '2';
        }
        if(otherParticipants.length >= 2) {
            this._schismingGroupByParticipantJid[otherParticipants[1].getJid()] = '1';
        }
        if(otherParticipants.length >= 3) {
            this._schismingGroupByParticipantJid[otherParticipants[2].getJid()] = '2';
        }
    }

    /**
     * Adjusts volume of participants in other schisming groups
     * @param newVolumeLevel {Number}
     * @param thisParticipantJid {Jid} The Jid of the participant executing this function.
     * @param otherParticipants {Array<JitsiParticipant>} Array of other participants of this conference.
     */
    adjustVolume(newVolumeLevel, thisParticipantJid, otherParticipants) {
        logger.info('adjustVolume called with newVolumeLevel=' + newVolumeLevel
            + ', thisParticipantJid=' + thisParticipantJid + ', otherParticipants=' + otherParticipants);

        this._setTestState(thisParticipantJid, otherParticipants); // TODO remove as soon as Jicofo is able to send SchismingHub

        var thisGroupId = this._getSchismingGroupIdForParticipant(thisParticipantJid);
        logger.info('Schisming group id for caller: ' + thisGroupId);

        for(var i = 0; i < otherParticipants.length; i++) {
            var participantGroupId = this._getSchismingGroupIdForParticipant(otherParticipants[i].getJid());
            if(participantGroupId != thisGroupId) {
                this._adjustVolumeForParticipant(newVolumeLevel, otherParticipants[i]);
            }
        }
    }

    _adjustVolumeForParticipant(newVolumeLevel, participant) {
        logger.info('Adjusting volume of participant ' + participant.getJid() + ' to ' + newVolumeLevel);
        // TODO probably need to get JitsiParticipant from JitsiConference
        // TODO get track for participant
        // TODO set volume on track
    }

    _getSchismingGroupIdForParticipant(participantJid) {
        return this._schismingGroupByParticipantJid[participantJid];
    }
}