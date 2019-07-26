import * as poppyjs from 'poppyjs-elem';

class AdminUserStatusEnum extends poppyjs.biz.BaseEnum {
}
AdminUserStatusEnum.Normal = 1;
AdminUserStatusEnum.Locked = 2;
AdminUserStatusEnum.Invalid = 3;

export default AdminUserStatusEnum;