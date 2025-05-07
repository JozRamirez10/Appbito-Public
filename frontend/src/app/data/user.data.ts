import { Months } from '../enums/months.enum';
import { User } from '../models/user';

export const userData : User[] = [
    {
        id : 1,
        name: 'Subject',
        lastname: 'Of Test',
        password: '1234',
        email: 'test@email.com',
        date: new Date(2000, Months.JAN, 1), // Month init in 0
        image: 'image.jpg'
    },
]

