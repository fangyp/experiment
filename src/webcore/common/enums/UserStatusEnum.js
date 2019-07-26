import poppyjs from 'poppyjs-elem'

class UserStatusEnum extends poppyjs.biz.BaseEnum {
}
UserStatusEnum.Normal = 1;
UserStatusEnum.Locked = 2;
UserStatusEnum.Invalid = -1;

export default UserStatusEnum