import { bijective_vl, nonbijective_vl, build_matrix } from '../voiceLeading';

describe('voiceLeading', () => {
  it('finds the voice bijectively', () => {
    expect('something').toEqual('something');

    expect(
      bijective_vl([0, 4, 7], [9, 12, 16])
    ).toEqual(
      [[0, 0], [4, 0], [7, 2]]
    );

    expect(
      bijective_vl([2,4,7,8], [9, 12, 16, 20])
    ).toEqual(
      [[2, -2], [4, 0], [7, 1], [8, 1]]
    );

    expect(
      bijective_vl([74, 171, 2, 4, 52, 19], [5, 3, 11, 65, 198, 2])
    ).toEqual(
      [[74, 0], [171, 2], [2, 1], [4, -5], [52, 1], [19, -1]]
    );

    expect(
      bijective_vl([60, 64, 67, 72], [60, 64, 67, 70])
    ).toEqual(
      [[60, 0], [64, 0], [67, 0], [72, -2]]
    );

  });

  it('nonbijective_vl', () => {
    expect(nonbijective_vl([0, 4, 7], [17, 21, 24, 28])).toEqual([3, [[0, 0], [4, 4], [4, 5], [7, 9]]]);
    expect(nonbijective_vl([0, 4, 7], [10, 13, 17])).toEqual([5, [[0, 1], [4, 5], [7, 10]]]);
    expect(nonbijective_vl([0, 4, 7], [10, 12, 13, 17])).toEqual([5, [[0, 0], [0, 1], [4, 5], [7, 10]]]);
    expect(nonbijective_vl([0, 4, 7, 11], [17, 21, 24])).toEqual([4, [[0, 0], [4, 5], [7, 9], [11, 0]]]);
  });

  it('build_matrix', () => {
    expect(build_matrix([0, 4, 7], [0, 4, 5, 9])).toEqual(3);
    expect(build_matrix([0, 4, 7], [4, 5, 9, 0])).toEqual(7);
    expect(build_matrix([0, 4, 7], [5, 9, 0, 4])).toEqual(10);
    expect(build_matrix([0, 4, 7], [9, 0, 4, 5])).toEqual(5);
  });
});
