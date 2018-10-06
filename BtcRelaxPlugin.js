/* global http, moment */

function BtcRelaxApi( v_server ,v_tokenKey )
{
    this.server = v_server !== null? v_server: 'fastfen.club';
    this.tokenKey = v_tokenKey  !== null? v_tokenKey: null;
}
